const ConfigManager = require('./struct/ConfigManager')
const LightbringerClient = require('./struct/LightbringerClient')
const Logger = require('./struct/Logger')

const logger = new Logger()
logger.inject()

const configManager = new ConfigManager('./config.json')
const config = configManager.load()

if (config.token) {
  const client = new LightbringerClient(
    {
      selfbot: true,
      prefix: config.prefix || 'lb',
      statusChannel: config.statusChannel,
      allowMention: false,
      automateCategories: true,
      emitters: {
        process
      },
      commandDirectory: './src/commands/',
      inhibitorDirectory: './src/inhibitors/',
      listenerDirectory: './src/listeners/',
      storageDirectory: './storage/',
      configManager
    },
    {
      disableEveryone: true
    }
  )

  console.log('Logging in\u2026')
  client.login(config.token)
} else {
  console.info('Token is missing from the configuration file.')
  console.info('Please edit the configuration file then start the bot again!')
  process.exit(1)
}
