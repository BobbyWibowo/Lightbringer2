const LCommand = require('./../../struct/LCommand')

class UpTimeCommand extends LCommand {
  constructor () {
    super('uptime', {
      aliases: ['uptime', 'up'],
      description: 'Displays the bot\'s uptime.',
      args: [
        {
          id: 'maxUnits',
          match: 'option',
          flag: ['--maxUnits=', '--max=', '-m='],
          description: 'Sets the maximum amount of time units being displayed.',
          type: 'integer',
          default: null
        },
        {
          id: 'short',
          match: 'flag',
          flag: ['--short', '-s'],
          description: 'Uses short format.'
        },
        {
          id: 'online',
          match: 'flag',
          flag: ['--online', '-o'],
          description: 'Displays online time instead (an internal uptime of the API library, this resets when a connection drop occurs).'
        }
      ],
      usage: 'uptime [--maxUnits=] [--short] [--online]'
    })
  }

  async exec (message, args) {
    let timeMs = Date.now() - this.client.startTimestamp
    if (args.online) { timeMs = this.client.uptime }
    await message.edit(`⏰\u2000${args.short ? 'Up' : 'Uptime'}: ${this.client.util.humanizeDuration(timeMs, args.maxUnits, args.short)}.`)
  }
}

module.exports = UpTimeCommand
