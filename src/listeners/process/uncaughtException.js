const { Listener } = require('discord-akairo')

class UncaughtExceptionListener extends Listener {
  constructor () {
    super('uncaughtException', {
      emitter: 'process',
      event: 'uncaughtException'
    })
  }

  async exec (error) {
    console.error(error)
  }
}

module.exports = UncaughtExceptionListener
