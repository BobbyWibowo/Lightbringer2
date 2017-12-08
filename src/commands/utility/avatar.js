const { Collection } = require('discord.js')
const { Command } = require('discord-akairo')
const { CommandHandlerEvents } = require('discord-akairo').Constants
const { escapeMarkdown } = require('discord.js').Util

class AvatarCommand extends Command {
  constructor () {
    super('avatar', {
      aliases: ['avatar', 'ava'],
      description: 'Displays full size of yours or someone else\'s avatar.',
      args: [
        {
          id: 'direct',
          match: 'flag',
          prefix: ['--direct', '-d'],
          description: 'Uses direct URL instead of CDN URL. This may not really work properly.'
        },
        {
          id: 'plain',
          match: 'flag',
          prefix: ['--plain', '-p'],
          description: 'Uses plain message (no embed).'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the avatar of.'
        }
      ],
      options: {
        usage: 'avatar [--direct] [--plain] [keyword]'
      }
    })
  }

  async exec (message, args) {
    if (!args.plain && !this.client.util.hasPermissions(message.channel, ['EMBED_LINKS'])) {
      return this.handler.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, this, 'client', ['EMBED_LINKS'])
    }

    /*
     * Refresh GuildMemberStore
     */

    if (message.guild) {
      await message.status.progress('Refreshing guild members information\u2026')
      await message.guild.members.fetch()
    }

    let member, user

    /*
     * Resolve GuildMember or User
     */

    if (args.keyword) {
      const resolved = this.client.util.resolveMemberOrUser(
        args.keyword,
        message.guild ? message.guild.members : null
      )

      if (resolved.failed) {
        return message.status.error('Could not find matching users!')
      }

      if ((resolved.member || resolved.user) instanceof Collection) {
        return message.status.error(
          this.client.util.formatMatchesList(resolved.member || resolved.user, {
            name: 'users',
            prop: ['tag', 'user.tag']
          }),
          this.client.util.matchesListTimeout
        )
      }

      member = resolved.member
      user = resolved.user
    } else {
      member = message.guild ? message.member : null
      user = message.author
    }

    const mention = this.client.util.isKeywordMentionable(args.keyword)
    let avatarURL = user.displayAvatarURL({ size: 2048 })

    if (!avatarURL) {
      return message.status.error('Could not get display avatar of the specified user!')
    }

    if (args.direct) {
      avatarURL = avatarURL.replace('cdn.discordapp.com', 'images.discordapp.net')
    }

    if (/\.gif\?size=\d*?$/.test(avatarURL)) {
      avatarURL += '&f=.gif'
    }

    /*
     * Send a plain message if --plain flag was used
     */

    if (args.plain) {
      return message.edit(`${mention ? user : escapeMarkdown(user.tag)}'s avatar: ${avatarURL}`)
    }

    /*
     * Otherwise, build then send embed
     */

    let content = 'My avatar:'
    if (args.keyword && mention) {
      content = `${(member || user).toString()}'s avatar:`
    } else if (args.keyword) {
      content = `Avatar of the user who matched \`${args.keyword}\`:`
    }

    const embed = {
      title: user.tag,
      description: `[Click here to view in a browser](${avatarURL})`,
      color: member ? member.displayColor : 0,
      image: avatarURL
    }

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = AvatarCommand
