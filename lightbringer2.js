const ConfigManager = require('./src/struct/ConfigManager')
const LightbringerClient = require('./src/struct/LightbringerClient')
const Logger = require('./src/util/Logger')

const whitelistedRejections = ['FetchError']
process.on('unhandledRejection', error => {
  if (error.constructor &&
    error.constructor.name &&
    whitelistedRejections.includes(error.constructor.name))
    error = error.toString()
  Logger.error(error, { tag: 'unhandledRejection' })
})
process.on('uncaughtException', error => {
  Logger.error(error, { tag: 'unhandledRejection' })
})

const configManager = new ConfigManager('./config.json')
configManager.load()

const token = configManager.get('token')

if (!token) {
  Logger.error('Token is missing from the configuration file.')
  Logger.error('Please edit the configuration file then start the bot again.')
  process.exit(1)
}

const client = new LightbringerClient(configManager)

process.on('exit', () => {
  if (client.storage)
    client.storage.saveAll()
})

client.start(token)
