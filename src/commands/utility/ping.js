const { stripIndents } = require('common-tags')
const LCommand = require('./../../struct/LCommand')

class PingCommand extends LCommand {
  constructor () {
    super('ping', {
      aliases: ['ping', 'pong'],
      description: 'Pings the bot!',
      selfdestruct: 30
    })
  }

  async exec (message) {
    message = await message.edit('🏓\u2000Pong!')

    // Elapsed time
    const elapsed = message.editedTimestamp - message.createdTimestamp
    await message.edit(stripIndents`
      🏓\u2000Elapsed: \`${elapsed}ms\`
      💓\u2000Heartbeat: \`${this.client.ping.toFixed(0)}ms\`
    `)
  }
}

module.exports = PingCommand
