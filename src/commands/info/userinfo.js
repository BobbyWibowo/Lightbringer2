const { Collection, Util } = require('discord.js')
const { Command } = require('discord-akairo')
const { escapeMarkdown } = Util
const { stripIndent } = require('common-tags')

class UserInfoCommand extends Command {
  constructor () {
    super('userinfo', {
      aliases: ['userinfo', 'uinfo', 'info'],
      description: 'Shows yours or another user\'s info.',
      args: [
        {
          id: 'keyword',
          match: 'content',
          description: 'The user that you want to display the information of.'
        }
      ],
      options: {
        usage: 'userinfo [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
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

    let member, user, profile

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

    /*
     * Fetch UserProfile
     */

    profile = !user.bot && await user.fetchProfile().catch(() => { })

    const mention = this.client.util.isKeywordMentionable(args.keyword)
    const avatarURL = user.displayAvatarURL({ size: 256 })

    /*
     * Account Information field
     */

    const embed = {
      fields: [
        {
          name: 'Account Information',
          value: stripIndent`
              •  **ID:** ${user.id}
              •  **Status:** ${user.presence.status}
              •  **Mention:** ${user.toString()}
              •  **Created:** ${this.client.util.formatFromNow(user.createdAt)}
            `
        }
      ]
    }

    /*
     * Account Information field:
     * Bot for bots;
     * Nitro and Mutual guilds for normal users
     */

    if (user.bot) {
      embed.fields[0].value += `\n•  **Bot:** yes`
    } else {
      embed.fields[0].value += `\n•  **Nitro${profile.premiumSince ? ' since' : ''}:** ${profile.premiumSince ? this.client.util.formatFromNow(profile.premiumSince) : 'no'}`
      if (user.id !== message.author.id) {
        embed.fields[0].value += `\n•  **Mutual guilds:** ${profile.mutualGuilds.size.toLocaleString() || '0'}`
      }
    }

    embed.fields[0].value += `\n•  **Avatar:** ${avatarURL
      ? `[${this.client.util.getHostName(avatarURL)}](${avatarURL})`
      : 'N/A'}`

    /*
     * Activity message
     */

    if (user.presence.activity) {
      embed.description = `${this.client.util.formatActivityType(user.presence.activity.type)} **${user.presence.activity.name}**`
    }

    /*
     * Guild Membership field
     */

    if (member) {
      embed.fields.push(
        {
          name: 'Guild Membership',
          value: stripIndent`
              •  **Nickname:** ${member.nickname ? escapeMarkdown(member.nickname) : 'N/A'}
              •  **Joined:** ${this.client.util.formatFromNow(member.joinedAt)}
            `
        }
      )

      const roles = member.roles
        .array()
        .slice(1)
        .sort((a, b) => a.position - b.position)
        .map(role => escapeMarkdown(role.name, true))

      embed.fields.push(
        {
          name: `Guild Roles [${roles.length}]`,
          value: this.client.util.formatCode(roles.length ? roles.join(', ') : 'N/A')
        }
      )
    } else if (message.guild) {
      embed.fields.push(
        {
          name: 'Guild Membership',
          value: '*This user is not a member of the currently viewed guild.*'
        }
      )
    }

    /*
     * Message content
     */

    let content = 'My information:'
    if (args.keyword && mention) {
      content = `${(member || user).toString()}'s information:`
    } else if (args.keyword) {
      content = `Information of the user who matched \`${args.keyword}\`:`
    }

    /*
     * Embed options
     */

    embed.thumbnail = avatarURL
    embed.color = member ? member.displayColor : 0
    embed.author = {
      name: user.tag,
      icon: avatarURL
    }

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = UserInfoCommand
