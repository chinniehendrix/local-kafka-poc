import { Config } from '@src/utilis/config/interface'
import { Logger } from '@src/utilis/logger'
import { KafkaClient } from './client'

export const runConsumer = async (config: Config, kafkaClient: KafkaClient, logger: Logger): Promise<void> => {
  logger.info(`Going to prepare consumer for topic: ${config.KAFKA_CONSUMER_TOPIC}`)
  await kafkaClient.subscribe(
    config.KAFKA_CONSUMER_TOPIC,
    {
      groupId: config.KAFKA_CONSUMER_GROUP_ID,
      sessionTimeout: config.KAFKA_CONSUMER_SESSION_TIMEOUT
    },
    () => Promise.resolve()
  )
}
