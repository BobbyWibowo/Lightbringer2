const { Listener } = require('discord-akairo')

class CommandStartedListener extends Listener {
  constructor () {
    super('commandStarted', {
      emitter: 'commandHandler',
      event: 'commandStarted'
    })

    this.initiated = false
  }

  async exec (message, command) {
    this.client.stats.increment('commands-started')
  }
}

module.exports = CommandStartedListener
