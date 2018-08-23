const { AkairoClient } = require('discord-akairo')
const BooruCache = require('./BooruCache')
const GuildColors = require('./GuildColors')
const LClientUtil = require('./LClientUtil')
const LCommandHandler = require('./LCommandHandler')
const LInhibitorHandler = require('./LInhibitorHandler')
const LListenerHandler = require('./LListenerHandler')
const Logger = require('./../util/Logger')
const path = require('path')
const Stats = require('./Stats')
const Storage = require('./Storage')

class LightbringerClient extends AkairoClient {
  constructor (configManager) {
    super({}, {
      messageCacheMaxSize: 10,
      sync: true,
      disabledEvents: [
        'TYPING_START'
      ]
    })

    this.configManager = configManager

    this.util = new LClientUtil(this, {
      matchesListTimeout: 15000,
      maxMatchesListLength: 20
    })

    this.stats = new Stats(this)

    this.storage = new Storage({
      directory: path.join(__dirname, '..', '..', 'storage')
    })

    this.data = {
      package: require('./../../package.json')
    }

    this.commandHandler = new LCommandHandler(this, {
      allowMention: true,
      automateCategories: true,
      blockClient: false,
      directory: path.join(__dirname, '..', 'commands'),
      prefix: configManager.get('prefix') || 'lb',
      purgeCommandsTimeout: 2500,
      statusTimeout: 7500
    })

    this.inhibitorHandler = new LInhibitorHandler(this, {
      automateCategories: true,
      directory: path.join(__dirname, '..', 'inhibitors')
    })

    this.listenerHandler = new LListenerHandler(this, {
      automateCategories: true,
      directory: path.join(__dirname, '..', 'listeners')
    })

    this.booruCache = new BooruCache(this, {
      storage: this.storage('booru-cache')
    })

    this.guildColors = new GuildColors(this, {
      storage: this.storage('guild-colors')
    })

    this.setup()
  }

  setup () {
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler)
    this.commandHandler.useListenerHandler(this.listenerHandler)

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    })

    this.commandHandler.loadAll()
    this.inhibitorHandler.loadAll()
    this.listenerHandler.loadAll()
  }

  async start (token) {
    this.startTimestamp = Date.now()
    this.startHrTime = process.hrtime()

    Logger.info('Logging in\u2026')
    Logger.warn('Users with large amount of guilds may take a few minutes to login!')
    await this.login(token)

    this.commandHandler.readyAll()
    this.inhibitorHandler.readyAll()
    this.listenerHandler.readyAll()
  }
}

module.exports = LightbringerClient
