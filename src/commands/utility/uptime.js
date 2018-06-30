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
        }
      ],
      usage: 'uptime [--maxUnits=] [--short]'
    })
  }

  async exec (message, args) {
    await message.edit(`⏰\u2000${args.short ? 'Up' : 'Uptime'}: ${this.client.util.humanizeDuration(Date.now() - this.client.startTimestamp, args.maxUnits, args.short)}.`)
  }
}

module.exports = UpTimeCommand
