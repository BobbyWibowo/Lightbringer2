const { Listener } = require('discord-akairo')

class CommandFinishedListener extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    })
  }

  async exec (message, command, args) {
    this.client.commandHandler.clearStatus(message)
  }
}

module.exports = CommandFinishedListener
