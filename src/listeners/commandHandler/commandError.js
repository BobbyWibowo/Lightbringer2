const { Listener } = require('discord-akairo')

class CommandErrorListener extends Listener {
  constructor () {
    super('commandError', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec (error, message, command) {
    console.error(error.stack || error)
    return message.status.error(
      'An unexpected error occurred (this message will self-destruct in 30 seconds):\n' +
      this.client.util.formatCode(error.stack || error, 'js'),
      { timeout: 30000 })
  }
}

module.exports = CommandErrorListener
