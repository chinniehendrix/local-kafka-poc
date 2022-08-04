import fs from 'fs'
import config from '@src/utilis/config'
import { Config } from '@src/utilis/config/interface'
import { Logger, logger } from '@src/utilis/logger'
import { KafkaConfig } from 'kafkajs'
import { uuid } from 'uuidv4'
import { KafkaClient, makeKafkaClient } from '@src/app/client'
import { runConsumer } from '@src/app/consumer'
import { runProducer } from '@src/app/producer'

export const loadKafkaClient = (config: Config, logger: Logger): KafkaClient => {
  const kafkaConfig: KafkaConfig = {
    clientId: `kafkajs-client-${uuid()}`,
    brokers: config.KAFKA_BROKERS.split(','),
    connectionTimeout: config.KAFKA_CLIENT_CONNECTION_TIMEOUT,
    requestTimeout: config.KAFKA_CLIENT_REQUEST_TIMEOUT,
    retry: { retries: config.KAFKA_CLIENT_RETRIES },
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync(`/ca-certs/ca.crt`, 'utf-8'),
      key: fs.readFileSync(`${config.KAFKA_CLIENT_KEY_PATH}`, 'utf-8'),
      cert: fs.readFileSync(`${config.KAFKA_CLIENT_CERT_PATH}`, 'utf-8')
    }
  }

  logger.debug(`loading kafka client`)
  return makeKafkaClient(kafkaConfig, logger)
}

logger.info(`app configured with MODE ${process.env.MODE}`)

const kafkaClient: KafkaClient = loadKafkaClient(config, logger)

switch (process.env.MODE) {
  case 'PRODUCER':
    runProducer(config, kafkaClient, logger)
    break
  case 'CONSUMER':
    runConsumer(config, kafkaClient, logger)
    break
}
