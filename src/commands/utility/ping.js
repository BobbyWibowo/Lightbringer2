const LCommand = require('./../../struct/LCommand')

class PingCommand extends LCommand {
  constructor () {
    super('ping', {
      aliases: ['ping', 'pong'],
      description: 'Pings the bot!'
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

module.exports = PingCommand
