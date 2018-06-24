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
    Logger.warn(warn.stack || warn)
  }
}

module.exports = WarnListener
