import emoji from 'node-emoji'
import { v4 as uuid } from 'uuid'
import {
  CompressionTypes,
  Kafka,
  KafkaMessage,
  IHeaders,
  ConsumerConfig,
  KafkaConfig,
  ConsumerCommitOffsetsEvent,
  logLevel,
  LogEntry,
  CompressionCodecs
} from 'kafkajs'
import LZ4 from 'kafkajs-lz4'
import config from '@src/utilis/config'
import { Logger } from '@src/utilis/logger'

CompressionCodecs[CompressionTypes.LZ4] = new LZ4().codec

const withPrefix = (prefix: string) => (message: string): string => `${prefix} ${message}`
const withModulePrefix = withPrefix('[kafka-client]')

export interface KafkaSubscription {
  disconnect(): Promise<void>
}

export interface KafkaClient {
  publish<T>(topic: string, msg: T, headers?: IHeaders): Promise<void>

  subscribe<TError>(
    topic: string,
    options: ConsumerConfig,
    onMessage: (msg: KafkaMessage) => Promise<void>
  ): Promise<void>
}

const defaultKafkaConfig: Partial<KafkaConfig> = {
  connectionTimeout: config.KAFKA_CLIENT_CONNECTION_TIMEOUT,
  requestTimeout: config.KAFKA_CLIENT_REQUEST_TIMEOUT,
  retry: { retries: config.KAFKA_CLIENT_RETRIES }
}

const defaultSubscriptionConfig: Partial<ConsumerConfig> = {
  sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT,
  heartbeatInterval: config.KAFKA_CONSUMER_HEARTBEAT_INTERVAL,
  retry: { retries: config.KAFKA_CONSUMER_RETRIES }
}

export function makeKafkaClient(configParams: KafkaConfig, logger: Logger): KafkaClient {
  logger.setPrefix('app')
  const logCreator = (logLevel: logLevel) => (logEntry: LogEntry) => {
    logger.debug(withModulePrefix(`logEntry:${JSON.stringify(logEntry)}`))
  }
  const kafkaConfig: KafkaConfig = {
    ...defaultKafkaConfig,
    ...configParams,
    logLevel: config.KAFKA_CLIENT_LOG_LEVEL,
    logCreator: logCreator
  }
  const kafka = new Kafka(kafkaConfig)
  logger.info(withModulePrefix(`Kafka client configured ${emoji.get('rainbow')}`))

  const producer = kafka.producer()

  return {
    async publish(topic, msg, headers?) {
      try {
        await producer.connect()
        logger.debug(withModulePrefix(`publisher connected to publish in topic: ${topic}`))

        const messageKey = uuid()
        await producer.send({
          topic,
          compression: CompressionTypes.LZ4,
          messages: [{ key: messageKey, value: JSON.stringify(msg), headers }]
        })
        logger.debug(withModulePrefix(`published message with id: ${messageKey} to topic ${topic}`))

        await producer.disconnect()
        logger.debug(withModulePrefix('publisher disconnected'))
        return
      } catch (error) {
        logger.error('KAFKA_PRODUCER_FAILURE', JSON.stringify({ error }))
        throw error
      }
    },
    subscribe: async function(topic, options, onMessage) {
      try {
        const kafkaConsumerConfig = { ...defaultSubscriptionConfig, ...options }

        const consumer = kafka.consumer(kafkaConsumerConfig)
        const {
          STOP,
          COMMIT_OFFSETS,
          CONNECT,
          GROUP_JOIN,
          FETCH_START,
          FETCH,
          START_BATCH_PROCESS,
          END_BATCH_PROCESS,
          DISCONNECT,
          CRASH,
          HEARTBEAT
        } = consumer.events

        const stopHearBeatListener = consumer.on(HEARTBEAT, event => {
          logger.debug(withModulePrefix(`HEARTBEAT event ${JSON.stringify(event)}`))
        })

        const stopCrashListener = consumer.on(CRASH, event => {
          logger.debug(withModulePrefix(`CRASH event ${JSON.stringify(event)}`))
        })

        const stopDisconnectListener = consumer.on(DISCONNECT, event => {
          logger.debug(withModulePrefix(`DISCONNECT event ${JSON.stringify(event)}`))
        })

        const stopConnectListener = consumer.on(CONNECT, event => {
          logger.debug(withModulePrefix(`CONNECT event ${JSON.stringify(event)}`))
        })

        const stopGroupJoinListener = consumer.on(GROUP_JOIN, event => {
          logger.debug(withModulePrefix(`GROUP_JOIN event ${JSON.stringify(event)}`))
        })

        const stopFetchStartListener = consumer.on(FETCH_START, event => {
          logger.debug(withModulePrefix(`FETCH_START event ${JSON.stringify(event)}`))
        })

        const stopFetchListener = consumer.on(FETCH, event => {
          logger.debug(withModulePrefix(`FETCH event ${JSON.stringify(event)}`))
        })

        const stopStartBachListener = consumer.on(START_BATCH_PROCESS, event => {
          logger.debug(withModulePrefix(`START_BATCH_PROCESS event ${JSON.stringify(event)}`))
        })

        const stopEndBachListener = consumer.on(END_BATCH_PROCESS, event => {
          logger.debug(withModulePrefix(`END_BATCH_PROCESS event ${JSON.stringify(event)}`))
        })

        const stopListener = consumer.on(STOP, event => {
          logger.info(`consumer in topic ${topic} stopped, trying to resume it ${JSON.stringify(event)}`)
          consumer.resume([{ topic }])
        })

        const commitListener = consumer.on(COMMIT_OFFSETS, (x: ConsumerCommitOffsetsEvent) => {
          logger.info(`Committed offset to kafka ${JSON.stringify(x.payload)}`)
        })

        const stopAllListener = () => {
          stopListener()
          commitListener()

          stopHearBeatListener()
          stopCrashListener()
          stopDisconnectListener()
          stopConnectListener()
          stopGroupJoinListener()
          stopFetchStartListener()
          stopFetchListener()
          stopStartBachListener()
          stopEndBachListener()
        }

        await consumer.connect()
        logger.info(withModulePrefix(`consumer configured with ${JSON.stringify(kafkaConsumerConfig)}`))
        logger.debug(withModulePrefix(`consumer of topic: ${topic}, and group: ${options.groupId} connected to queue`))
        await consumer.subscribe({ topic })
        logger.debug(withModulePrefix(`consumer subscribed to topic: ${topic}`))
        await consumer.run({
          partitionsConsumedConcurrently: 1,
          autoCommit: false,
          eachMessage: async ({ topic, partition, message }) => {
            const msg = message?.value?.toString()
            const key = (message.key && message.key.toString()) || null
            const messageLog = `[topic:${topic}][partition:${partition}][offset:${message.offset}][key:${key}][message:${msg}]`
            logger.debug(withModulePrefix(`[NEW_MESSAGE]${messageLog}`))

            try {
              await onMessage(message)
              logger.debug(withModulePrefix(`[ON_MESSAGE_SUCCESS]${messageLog}`))

              const newOffset = (Number(message.offset) + 1).toString()
              await consumer.commitOffsets([{ topic, partition, offset: newOffset }])
              logger.debug(withModulePrefix(`[ON_MESSAGE_COMMITED]${messageLog} newOffset: ${newOffset}`))
            } catch (error) {
              logger.error(withModulePrefix(`[ON_MESSAGE_ERROR]${messageLog} ${JSON.stringify(error)}`))
              throw error
            }
          }
        })

        return
      } catch (error) {
        logger.error('KAFKA_CONSUMER_FAILURE', JSON.stringify({ error }))
        return
      }
    }
  }
}
