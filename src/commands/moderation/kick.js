const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class KickCommand extends Command {
  constructor () {
    super('kick', {
      aliases: ['kick'],
      description: 'Kicks someone.',
      split: 'sticky',
      args: [
        {
          id: 'reason',
          match: 'prefix',
          prefix: ['--reason=', '-r='],
          description: 'Reason for kicking.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild member that you want to kick.'
        }
      ],
      options: {
        usage: 'ban [--reason=] <keyword>'
      }
    })
  }

  async exec (message, args) {
    if (!message.guild) {
      return message.status.error('You can only use this command in a guild!')
    }

    if (!args.keyword) {
      return message.status.error('You must specify a member to kick!')
    }

    /*
     * Refresh GuildMemberStore
     */

    await message.guild.members.fetch()

    /*
     * Resolve GuildMember then kick
     */

    const resolved = this.client.util.resolveMembers(args.keyword, message.guild.members)

    if (resolved.size === 1) {
      const target = resolved.first()
      await target.kick(args.reason)
      return message.status.success(`Successfully kicked ${escapeMarkdown(target.user.tag)} (ID: ${target.user.id}).`, -1)
    } else if (resolved.size > 1) {
      return message.status.error(
        this.client.util.formatMatchesList(resolved, {
          name: 'members',
          prop: 'user.tag'
        }),
        this.client.util.matchesListTimeout
      )
    } else {
      return message.status.error('Could not find matching guild members!')
    }
  }
}

module.exports = KickCommand
