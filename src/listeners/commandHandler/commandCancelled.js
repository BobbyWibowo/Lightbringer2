const { Listener } = require('discord-akairo')

class CommandCancelledListener extends Listener {
  constructor () {
    super('commandCancelled', {
      emitter: 'commandHandler',
      event: 'commandCancelled'
    })
  }

  async exec (message, command, args) {
    this.client.commandHandler.clearStatus(message)
  }
}

module.exports = CommandCancelledListener
