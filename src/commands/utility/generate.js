const { Command } = require('discord-akairo')

class GenerateCommand extends Command {
  constructor () {
    super('generate', {
      aliases: ['generate', 'gen'],
      description: 'Generate an MD file containing brief information of all non-hidden commands. The result will be used for the GitHub repository.'
    })
  }

  async exec (message) {
    // Start time
    const timestamp = new Date().getTime()
    message = await message.edit('🏓\u2000Pong.')

    // Elapsed time
    const elapsed = new Date().getTime() - timestamp
    await message.edit(`${message.content} \`${elapsed}ms\` – Heartbeat: \`${this.client.ping.toFixed(0)}ms\``)
  }
}

module.exports = GenerateCommand
