const { DiscordAPIError } = require('discord.js')
const { Listener } = require('discord-akairo')

class CommandErrorListener extends Listener {
  constructor () {
    super('commandError', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec (error, message, command) {
    if (error instanceof DiscordAPIError) {
      // console.error(error.toString())
      await message.status.error(error.toString())
    } else {
      console.error(error.stack || error)
      await message.status.error(
        'An unexpected error occurred (this message will self-destruct in 30 seconds):\n' +
        this.client.util.formatCode(error.stack || error, 'js'),
        { timeout: 30000 })
    }

    this.client.commandHandler.clearStatus(message)
  }
}

module.exports = CommandErrorListener
