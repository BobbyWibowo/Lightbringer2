const { Command } = require('discord-akairo')

class ShutDownCommand extends Command {
  constructor () {
    super('shutdown', {
      aliases: ['shutdown', 'exit'],
      description: 'Shuts down the bot!'
    })
  }

  async exec (message) {
    await message.edit('👋\u2000Shutting down\u2026 See you next time!')
    process.exit(0)
  }
}

module.exports = ShutDownCommand
