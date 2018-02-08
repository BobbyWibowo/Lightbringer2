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
    // When "--plain" flag is not used in channels where user have no permission to use embeds.
    if (!args.plain && !this.client.util.hasPermissions(message.channel, ['EMBED_LINKS'])) {
      return this.handler.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, this, 'client', ['EMBED_LINKS'])
    }

    // Assert GuildMember or User.
    const memberSource = message.guild || null
    const resolved = await this.client.util.assertMemberOrUser(args.keyword, memberSource, true)
    const member = resolved.member
    const user = resolved.user

    // Check whether the keyword was a mention or not.
    const mention = this.client.util.isKeywordMentionable(args.keyword)

    // Get user's avatar.
    let avatarURL = user.displayAvatarURL({ size: 2048 })

    // If could not get avatar.
    if (!avatarURL) {
      return message.status.error('Could not get display avatar of the specified user!')
    }

    // "--direct" flag.
    if (args.direct) {
      avatarURL = avatarURL.replace('cdn.discordapp.com', 'images.discordapp.net')
    }

    // When the avatar is a GIF, append "&f=.gif" so that the Discord client will properly play it.
    if (/\.gif\?size=\d*?$/.test(avatarURL)) {
      avatarURL += '&f=.gif'
    }

    // Send a plain message when "--plain" flag is used.
    if (args.plain) {
      return message.edit(`${mention ? user : escapeMarkdown(user.tag)}'s avatar:\n${avatarURL}`)
    }

    // Otherwise, build embed then send it.
    let content = 'My avatar:'
    if (args.keyword && mention) {
      content = `${(member || user).toString()}'s avatar:`
    } else if (args.keyword) {
      content = `Avatar of the user who matched keyword \`${args.keyword}\`:`
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
