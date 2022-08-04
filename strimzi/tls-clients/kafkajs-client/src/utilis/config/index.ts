import joi from '@hapi/joi'
import { Config } from './interface'

const configurationSchema = joi
  .object<Config>({
    LOG_LEVEL: joi.string().required(),

    KAFKA_BROKERS: joi.string().required(),
    KAFKA_CLIENT_CONNECTION_TIMEOUT: joi.number().required(),
    KAFKA_CLIENT_REQUEST_TIMEOUT: joi.number().required(),
    KAFKA_CLIENT_RETRIES: joi.number().required(),
    KAFKA_CLIENT_LOG_LEVEL: joi.number().required(),
    KAFKA_CONSUMER_SESSION_TIMEOUT: joi.number().required(),
    KAFKA_CONSUMER_HEARTBEAT_INTERVAL: joi.number().required(),
    KAFKA_CONSUMER_RETRIES: joi.number().required(),

    KAFKA_CONSUMER_TOPIC: joi.string().required(),
    KAFKA_CONSUMER_GROUP_ID: joi.string().required(),

    KAFKA_PRODUCER_TOPIC: joi.string().required(),

    KAFKA_CLIENT_CERT_PATH: joi.string().required(),
    KAFKA_CLIENT_KEY_PATH: joi.string().required()
  })
  .unknown(true)

function configureEnvironmentVariables(): Config {
  const { error, value } = configurationSchema.validate(process.env)
  if (error) {
    console.error(`[ConfigUnrecoverableError] [${error.details[0].message})]`)
    throw new Error(error.message)
  }
  return value
}

export default configureEnvironmentVariables()
