import { Config } from '@src/utilis/config/interface'
import { Logger } from '@src/utilis/logger'
import { KafkaClient } from './client'

export const runProducer = async (config: Config, kafkaClient: KafkaClient, logger: Logger): Promise<void> => {
  const messages: string[] = ['message one', 'message two', 'message three']

  const produceMessage = async (message: string) => {
    try {
      logger.info(`publishing message ${message}`)
      await kafkaClient.publish<string>(config.KAFKA_PRODUCER_TOPIC, message)
      logger.info(`message ${message} published`)
    } catch (error) {
      logger.info(`An error ocurred publish message ${message} ${JSON.stringify(error)}`)
    }
  }

  for await (const message of messages) {
    await produceMessage(message)
  }
}
