const { stripIndents } = require('common-tags')
const LCommand = require('./../../struct/LCommand')
const os = require('os')

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
      usage: 'uptime [--maxUnits=] [--short] [--online]',
      selfdestruct: 30
    })
  }

  async run (message, args) {
    let timeMs = Date.now() - this.client.startTimestamp
    if (args.online) timeMs = this.client.uptime
    await message.edit(stripIndents`
      ⏰\u2000Bot${args.short ? '' : ' uptime'}${args.online ? ' (lib)' : ''}: ${this.client.util.humanizeDuration(timeMs, args.maxUnits, args.short)}
      🖥\u2000Sys${args.short ? '' : 'tem uptime'}: ${this.client.util.humanizeDuration(os.uptime * 1000, args.maxUnits, args.short)}
    `)
  }
}

module.exports = UpTimeCommand
