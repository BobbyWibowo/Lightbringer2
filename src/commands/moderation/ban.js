const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class BanCommand extends Command {
  constructor () {
    super('ban', {
      aliases: ['ban'],
      description: 'Bans someone.',
      split: 'sticky',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild member that you want to ban.'
        },
        {
          id: 'reason',
          match: 'prefix',
          prefix: '--reason=',
          description: 'Reason for banning.'
        },
        {
          id: 'days',
          type: 'number',
          match: 'prefix',
          prefix: ['--days=', '--day=', '--delete='],
          description: 'Number of days of messages to delete.'
        },
        {
          id: 'soft',
          match: 'flag',
          prefix: ['--soft', '-s'],
          description: 'Soft-ban (will immediately unban the user after the ban).'
        }
      ]
    })
  }

  async exec (message, args) {
    /*
     * Refresh GuildMemberStore
     */

    if (message.guild) {
      await message.status.progress('Refreshing guild members information\u2026')
      await message.guild.members.fetch()
    }

    /*
     * Resolve GuildMember then ban
     */

    const resolved = this.client.util.resolveMembers(args.keyword, message.guild.members)

    if (resolved.size === 1) {
      const target = resolved.first()
      await target.ban({
        days: args.days || 0,
        reason: args.reason
      })
      if (args.soft) {
        await message.guild.unban(target.user.id)
      }
      return message.status.success(`Successfully ${args.soft ? 'soft-' : ''}banned ${escapeMarkdown(target.user.tag)} (ID: ${target.user.id}).`, { timeout: -1 })
    } else if (resolved.size > 1) {
      return message.status.error(this.client.util.formatMatchesList(resolved, { timeout: this.client.util.matchesListTimeout }))
    } else {
      return message.status.error('Could not find matching guild members!')
    }
  }
}

module.exports = BanCommand
