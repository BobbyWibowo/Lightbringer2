const { Command } = require('discord-akairo')

class UpTimeCommand extends Command {
  constructor () {
    super('uptime', {
      aliases: ['uptime'],
      description: 'Displays the bot\'s uptime.',
      args: [
        {
          id: 'maxUnits',
          match: 'prefix',
          prefix: ['--maxUnits=', '--max=', '-m='],
          description: 'Sets the maximum amount of time units being displayed.',
          type: 'integer',
          default: null
        },
        {
          id: 'short',
          match: 'flag',
          prefix: ['--short', '-s'],
          description: 'Uses short format.'
        }
      ],
      options: {
        usage: 'uptime [--maxUnits=] [--short]'
      }
    })
  }

  async exec (message, args) {
    await message.edit(`⏰\u2000${args.short ? 'Up' : 'Uptime'}: ${this.client.util.humanizeDuration(this.client.uptime, args.maxUnits, args.short)}.`)
  }
}

module.exports = UpTimeCommand
