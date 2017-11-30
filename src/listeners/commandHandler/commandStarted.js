const { Listener } = require('discord-akairo')

class CommandStartedListener extends Listener {
  constructor () {
    super('commandStarted', {
      emitter: 'commandHandler',
      event: 'commandStarted'
    })
  }

  async exec (message, command, args) {
    this.client.stats.increment('commands-started')
  }
}

module.exports = CommandStartedListener
