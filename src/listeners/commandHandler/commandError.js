const { DiscordAPIError } = require('discord.js')
const { AkairoError, Listener } = require('discord-akairo')

class CommandErrorListener extends Listener {
  constructor () {
    super('commandError', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec (error, message, command) {
    if (error instanceof DiscordAPIError || error instanceof AkairoError) {
      await message.status.error(error.toString())
    } else {
      console.error(error.stack || error)
      await message.status.error(
        'An unexpected error occurred (this message will self-destruct in 30 seconds):\n' +
        this.client.util.formatCode(error.stack || error, 'js'),
        30000 // timeout (30s)
      )
    }

    this.client.commandHandler.clearStatus(message)
  }
}

module.exports = CommandErrorListener
