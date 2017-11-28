const { Command } = require('discord-akairo')

class KickCommand extends Command {
  constructor () {
    super('kick', {
      aliases: ['kick'],
      description: 'Kicks some users.',
      split: 'sticky',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild member that you want to kick.'
        },
        {
          id: 'reason',
          match: 'prefix',
          prefix: '--reason=',
          description: 'Reason for the kick.'
        }
      ]
    })
  }

  async exec (message, args) {
    if (message.guild) {
      await message.status.progress('Refreshing guild members information\u2026')
      await message.guild.members.fetch()
    }

    const resolved = this.client.util.resolveMembers(args.keyword, message.guild.members)

    if (resolved.size === 1) {
      const target = resolved.first()
      await target.kick(args.reason)
      return message.status.success(`Successfully kicked ${target.user.tag} (ID: ${target.user.id}).`)
    } else if (resolved.size > 1) {
      return message.status.error(this.client.util.formatMatchesList(resolved, { timeout: this.client.util.matchesListTimeout }))
    } else {
      return message.status.error('Could not find matching guild members!')
    }
  }
}

module.exports = KickCommand
