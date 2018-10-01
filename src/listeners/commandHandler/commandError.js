const { AkairoError, Listener } = require('discord-akairo')
const { DiscordAPIError } = require('discord.js')
const LError = require('./../../util/LError')
const Logger = require('./../../util/Logger')

class CommandErrorListener extends Listener {
  constructor () {
    super('commandError', {
      emitter: 'commandHandler',
      event: 'error'
    })
  }

  async exec (error, message, command) {
    if (error instanceof DiscordAPIError || error instanceof AkairoError) {
      return message.status('error', error.toString())
    } else if (error instanceof LError) {
      return message.status('error', error.message, error.timeout)
    }

    Logger.error(error.stack || error, { tag: command ? command.id : 'unknownContext' })
    return message.status('error',
      'An unexpected error occurred (this message will self-destruct in 30 seconds):\n' +
        this.client.util.formatCode(error.stack || error, 'js'),
      30000
    )
  }
}

module.exports = CommandErrorListener
