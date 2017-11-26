const { AkairoClient } = require('discord-akairo')
const ExtendedClientUtil = require('./ExtendedClientUtil')
const ExtendedCommandHandler = require('./ExtendedCommandHandler')
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

    this.util = new ExtendedClientUtil(this)

    this.stats = new Stats(this)

    this.storage = new Storage(this)

    this.package = require('./../../package.json')
  }

  build () {
    if (this.akairoOptions.commandDirectory && !this.commandHandler) {
      this.commandHandler = new ExtendedCommandHandler(this)
    }

    return super.build()
  }
}

module.exports = LightbringerClient
