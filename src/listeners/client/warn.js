const { Listener } = require('discord-akairo')
const Logger = require('./../../util/Logger')

class WarnListener extends Listener {
  constructor () {
    super('warn', {
      emitter: 'client',
      event: 'warn'
    })
  }

  async exec (warn) {
    Logger.warn(warn, { tag: this.id })
  }
}

module.exports = WarnListener
