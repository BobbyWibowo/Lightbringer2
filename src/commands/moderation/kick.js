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
          id: 'refresh',
          match: 'flag',
          prefix: ['--refresh'],
          description: 'Refresh guild members (should be used in large guilds). This works the same as "membersfetch" command, so you should have no need to use this flag IF you had already used "membersfetch" not too long ago.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild member that you want to kick.'
        }
      ],
      options: {
        usage: 'ban [--reason=] [--refresh] <keyword>'
      },
      clientPermissions: ['BAN_MEMBERS']
    })
  }

  async exec (message, args) {
    if (!message.guild) {
      return message.status('error', 'You can only use this command in a guild.')
    }

    if (!args.keyword) {
      return message.status('error', 'You must specify a guild member to kick.')
    }

    if (args.refresh) {
      // Refresh GuildMemberStore.
      await message.status('progress', 'Refreshing guild members\u2026')
      await message.guild.members.fetch()
    }

    // Resolve GuildMember then kick.
    const resolved = this.client.util.resolveMembers(args.keyword, message.guild.members)

    if (resolved.size === 0) {
      return message.status('error', 'Could not find matching guild members.')
    }

    if (resolved.size > 1) {
      return message.status('error',
        this.client.util.formatMatchesList(resolved, {
          name: 'guild members',
          prop: 'user.tag'
        }),
        this.client.util.matchesListTimeout
      )
    }

    // Proceed if there was only one result.
    const target = resolved.first()

    if (target.user.id === this.client.user.id) {
      return message.status('error', 'You can not kick yourself.')
    }

    if (target.user.id === message.guild.ownerID) {
      return message.status('error', 'You can not kick the server owner.')
    }

    await target.kick(args.reason)
    return message.status('success', `Successfully kicked ${escapeMarkdown(target.user.tag)} (ID: ${target.user.id}).`, -1)
  }
}

module.exports = KickCommand
