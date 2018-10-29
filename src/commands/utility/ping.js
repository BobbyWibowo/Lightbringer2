const LCommand = require('./../../struct/LCommand')

class PingCommand extends LCommand {
  constructor () {
    super('ping', {
      aliases: ['ping', 'pong'],
      description: 'Pings the bot!',
      selfdestruct: 15
    })
  }

  async exec (message) {
    message = await message.edit('🏓\u2000Pong.')

    // Elapsed time
    const elapsed = message.editedTimestamp - message.createdTimestamp
    await message.edit(`${message.content} \`${elapsed}ms\` – Heartbeat: \`${this.client.ping.toFixed(0)}ms\` | ${this.selfdestruct(true)}`)
  }
}

module.exports = PingCommand
