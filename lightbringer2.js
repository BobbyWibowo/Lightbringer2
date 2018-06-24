const ConfigManager = require('./src/struct/ConfigManager')
const Logger = require('./src/util/Logger')
const LightbringerClient = require('./src/struct/LightbringerClient')

process.on('unhandledRejection', Logger.error)
process.on('uncaughtException', Logger.error)

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
  if (client.storage) {
    client.storage.saveAll()
  }
})

Logger.log('Logging in\u2026')
client.login(token)
