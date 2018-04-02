const { Listener } = require('discord-akairo')

class CommandFinishedListener extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    })
  }

  async exec (message, command, args) {
    // TODO: Do something, I don't know.
  }
}

module.exports = CommandFinishedListener
