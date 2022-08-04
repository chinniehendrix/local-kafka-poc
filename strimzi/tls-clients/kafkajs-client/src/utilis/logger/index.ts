/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransformableInfo } from 'logform'
import winston, { Logger as WinstonLogger } from 'winston'
import { memoryUsage } from 'process'
import { uuid } from 'uuidv4'
import config from '../config'

const { format } = winston

export type MemoryUsage = ReturnType<typeof memoryUsage>

const templateTabs = () => () => (info: TransformableInfo): string =>
  `[${info.level}] [${info.timestamp}] [${info.message}]`

export const consoleFormatLog = (): any => templateTabs()

function loadWinstonLogger(getMemoryUsage: () => MemoryUsage, instanceId: string) {
  const consoleTransport = new winston.transports.Console({
    format: format.combine(format.timestamp(), format.printf(consoleFormatLog()(getMemoryUsage, instanceId))),
    level: config.LOG_LEVEL,
    handleExceptions: true
  })

  return winston.createLogger({ format: winston.format.json(), transports: [consoleTransport] })
}

export const formatMessage = (messages: string[], prefix: string): string => `[${prefix}] ${messages.join(' ')}`

const makeLogger = (_logger: WinstonLogger) => {
  let prefix = ''
  let logger = _logger

  return {
    reconfigureWithCustomLogger: (fn: () => WinstonLogger): void => {
      logger = fn()
    },
    setLevel: (level: string) => {
      logger.level = level
    },
    getLevel: () => logger.level,
    setPrefix: (_prefix: string) => {
      prefix = _prefix
    },
    mute: () => {
      logger.level = 'none'
    },
    unmute: () => {
      logger.level = config.LOG_LEVEL
    },
    error: (...messages: string[]) => {
      if (logger.level !== 'none') logger.error(formatMessage(messages, prefix))
    },
    warn: (...messages: string[]) => {
      if (logger.level !== 'none') logger.warn(formatMessage(messages, prefix))
    },
    info: (...messages: string[]) => {
      if (logger.level !== 'none') logger.info(formatMessage(messages, prefix))
    },
    verbose: (...messages: string[]) => {
      if (logger.level !== 'none') logger.verbose(formatMessage(messages, prefix))
    },
    debug: (...messages: string[]) => {
      if (logger.level !== 'none') logger.debug(formatMessage(messages, prefix))
    },
    silly: (...messages: string[]) => {
      if (logger.level !== 'none') logger.silly(formatMessage(messages, prefix))
    }
  }
}

export type Logger = ReturnType<typeof makeLogger>

export const logger: Logger = makeLogger(loadWinstonLogger(memoryUsage, uuid()))
