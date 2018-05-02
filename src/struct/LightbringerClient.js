const { AkairoClient } = require('discord-akairo')
const BooruCache = require('./BooruCache')
const GuildColors = require('./GuildColors')
const LClientUtil = require('./LClientUtil')
const LCommandHandler = require('./LCommandHandler')
const LInhibitorHandler = require('./LInhibitorHandler')
const LListenerHandler = require('./LListenerHandler')
const path = require('path')
const Stats = require('./Stats')
const Storage = require('./Storage')

class LightbringerClient extends AkairoClient {
  constructor (configManager) {
    super({
      selfbot: true,
      allowMention: false,
      automateCategories: true,
      prefix: configManager.get('prefix') || 'lb',
      commandDirectory: path.join(__dirname, '..', 'commands'),
      inhibitorDirectory: path.join(__dirname, '..', 'inhibitors'),
      listenerDirectory: path.join(__dirname, '..', 'listeners'),
      storageDirectory: path.join(__dirname, '..', '..', 'storage'),
      statusTimeout: 7500,
      purgeCommandsTimeout: 2500
    }, {
      messageCacheMaxSize: 10,
      sync: true,
      disabledEvents: [
        'TYPING_START'
      ]
    })

    this.configManager = configManager

    this.util = new LClientUtil(this)

    this.stats = new Stats(this)

    this.storage = new Storage(this)

    this.booruCache = new BooruCache(this)

    this.guildColors = new GuildColors(this)

    this.package = require('./../../package.json')
  }

  build () {
    if (this._built) {
      throw new Error('Client handlers can only be built once.')
    }

    this._built = true

    if (this.akairoOptions.configManager) {
      this.configManager = this.akairoOptions.configManager
      delete this.akairoOptions.configManager
    }

    if (this.akairoOptions.commandDirectory && !this.commandHandler) {
      this.commandHandler = new LCommandHandler(this)
    }

    if (this.akairoOptions.inhibitorDirectory && !this.inhibitorHandler) {
      this.inhibitorHandler = new LInhibitorHandler(this)
    }

    if (this.akairoOptions.listenerDirectory && !this.listenerHandler) {
      this.listenerHandler = new LListenerHandler(this)
    }

    this.startTimestamp = Date.now()

    return this
  }
}

module.exports = LightbringerClient
