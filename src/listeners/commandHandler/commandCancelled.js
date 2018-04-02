const { Listener } = require('discord-akairo')

class CommandCancelledListener extends Listener {
  constructor () {
    super('commandCancelled', {
      emitter: 'commandHandler',
      event: 'commandCancelled'
    })
  }

  async exec (message, command, args) {
    // TODO: Do something, I don't know.
  }
}

module.exports = CommandCancelledListener
