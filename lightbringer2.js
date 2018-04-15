const ConfigManager = require('./src/struct/ConfigManager')
const Logger = require('./src/struct/Logger')
const LightbringerClient = require('./src/struct/LightbringerClient')

const configManager = new ConfigManager('./config.json')
configManager.load()

const logger = new Logger()
logger.inject()

const token = configManager.get('token')

if (!token) {
  console.info('Token is missing from the configuration file.')
  console.info('Please edit the configuration file then start the bot again.')
  process.exit(1)
}

const client = new LightbringerClient(configManager)

process.on('unhandledRejection', err => {
  console.error(err)
})

process.on('uncaughtException', err => {
  console.error(err)
})

process.on('exit', () => {
  if (client.storage) {
    client.storage.saveAll()
  }
})

console.log('Logging in\u2026')
client.login(token)
