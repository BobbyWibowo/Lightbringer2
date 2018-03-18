const { AkairoClient } = require('discord-akairo')
const LClientUtil = require('./LClientUtil')
const LCommandHandler = require('./LCommandHandler')
const LInhibitorHandler = require('./LInhibitorHandler')
const LListenerHandler = require('./LListenerHandler')
const Stats = require('./Stats')
const Storage = require('./Storage')

class LightbringerClient extends AkairoClient {
  /**
   * The Lightbringer client.
   * @param {AkairoOptions} [options={}] - Options to use for the Akairo framework.
   * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
   */
  constructor (options = {}, clientOptions) {
    super(options, clientOptions)

    this.util = new LClientUtil(this)

    this.stats = new Stats(this)

    this.storage = new Storage(this)

    this.package = require('./../../package.json')

    // Init Guild Pixel Averages utils (this needs this.storage to be ready).
    this.util.initGuildColors()
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

    return this
  }
}

module.exports = LightbringerClient
