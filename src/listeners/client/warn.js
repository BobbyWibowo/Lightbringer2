const { Listener } = require('discord-akairo')

class WarnListener extends Listener {
  constructor () {
    super('warn', {
      emitter: 'client',
      event: 'warn'
    })
  }

  async exec (warn) {
    console.info(warn.stack || warn)
  }
}

module.exports = WarnListener
