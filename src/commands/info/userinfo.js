const { Command } = require('discord-akairo')
const { stripIndent } = require('common-tags')

const MAX_MATCHES_LENGTH = 20
const MATCHES_LIST_TIMEOUT = 15000

class UserInfoCommand extends Command {
  constructor () {
    super('userinfo', {
      aliases: ['userinfo', 'uinfo', 'info'],
      description: 'Shows yours or another user\'s info.',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the information of.'
        },
        {
          id: 'mutual',
          match: 'flag',
          prefix: ['--mutual', '-m'],
          description: 'Lists your mutual guilds with the user.'
        }
      ],
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (message.guild) {
      await message.status.progress('Refreshing guild members information\u2026')
      await message.guild.members.fetch()
    }

    let member, user

    // First attempt to get an instance of GuildMember from the keyword
    if (message.guild) {
      if (args.keyword) {
        const resolved = this.client.util.resolveMembers(args.keyword, message.guild.members)
        if (resolved.size > 1) {
          return message.status.error(this.formatMatchesList(resolved), { timeout: MATCHES_LIST_TIMEOUT })
        } else if (resolved.size === 1) {
          member = resolved.first()
          user = member.user
        }
      } else {
        member = message.member
        user = member.user
      }
    }

    // If no GuildMember could be found, attempt to get an instance
    // of User from this.client.users (all users cached by the bot)
    if (!user) {
      if (args.keyword) {
        const resolved = this.client.util.resolveUsers(args.keyword, this.client.users)
        if (resolved.size > 1) {
          return message.status.error(this.formatMatchesList(resolved), { timeout: MATCHES_LIST_TIMEOUT })
        } else if (resolved.size === 1) {
          user = resolved.first()
        } else {
          return message.status.error('No users could be found with that keyword!')
        }
      } else {
        user = message.author
      }
    }

    let profile
    try {
      profile = !user.bot && await user.fetchProfile()
    } catch (error) {}

    const mention = this.client.util.isKeywordMentionable(args.keyword)
    const avatarURL = user.displayAvatarURL({ size: 256 })

    if (args.mutual) {
      return message.status.error('This action is not yet available!')
    } else {
      const embed = {
        fields: [
          {
            name: 'Account Information',
            value: stripIndent`
              •  **ID:** ${user.id}
              •  **Status:** ${user.presence.status}
              •  **Created:** ${this.client.util.formatFromNow(user.createdAt)}
            `
          }
        ]
      }

      if (user.bot) {
        embed.fields[0].value += `\n•  **Bot:** yes`
      } else {
        embed.fields[0].value += `\n•  **Nitro${profile.premiumSince ? ' since' : ''}:** ` +
          (profile.premiumSince ? this.client.util.formatFromNow(profile.premiumSince) : 'no')
        if (user.id !== message.author.id) {
          embed.fields[0].value += `\n•  **Mutual guilds:** ${profile.mutualGuilds.size.toLocaleString() || '0'}`
        }
      }

      embed.fields[0].value += `\n•  **Avatar:** ${avatarURL
        ? `[${this.client.util.getHostName(avatarURL)}](${avatarURL})`
        : 'N/A'}`

      if (member) {
        embed.fields.push(
          {
            name: 'Guild Membership',
            value: stripIndent`
              •  **Nickname:** ${member.nickname || 'N/A'}
              •  **Joined:** ${this.client.util.formatFromNow(member.joinedAt)}
            `
          }
        )

        const roles = member.roles
          .array()
          .slice(1)
          .sort((a, b) => a.position - b.position)
          .map(role => role.name)

        embed.fields.push(
          {
            name: `Guild Roles [${roles.length}]`,
            value: roles.length ? roles.join(', ') : 'N/A'
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

      let content = 'My information:'
      if (args.keyword && mention) {
        content = `${(member || user).toString()}'s information:`
      } else if (args.keyword) {
        content = `Information of the user who matched \`${args.keyword}\`:`
      }

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

  formatMatchesList (matches) {
    if (!matches) {
      return 'Nobody could be found with that keyword. Please try again!'
    }

    const size = matches.size

    let list = matches
      .map(u => u.tag || u.user.tag)
      .sort((a, b) => a.localeCompare(b))

    list.length = Math.min(MAX_MATCHES_LENGTH, size)

    if (size > MAX_MATCHES_LENGTH) {
      list.push(`and ${size - list.length} more ...`)
    }

    return 'Multiple users found, please be more specific:\n' +
      this.client.util.formatCode(list.join(', '), 'css')
  }
}

module.exports = UserInfoCommand
