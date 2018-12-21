const { escapeMarkdown } = require('discord.js').Util
const { stripIndent } = require('common-tags')
const LCommand = require('./../../struct/LCommand')

class UserInfoCommand extends LCommand {
  constructor () {
    super('userinfo', {
      aliases: ['userinfo', 'uinfo', 'info'],
      description: 'Shows yours or another user\'s info.',
      split: 'sticky',
      args: [
        {
          id: 'guild',
          match: 'option',
          flag: ['--guild=', '-g='],
          description: 'Tries to fetch member information from a specific guild instead.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the information of.'
        }
      ],
      usage: 'userinfo [--guild=] [keyword]',
      selfdestruct: 60,
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    // Assert GuildMember or User.
    const memberSource = args.guild || message.guild || null
    const resolved = await this.client.util.assertMemberOrUser(args.keyword, memberSource, true)
    const member = resolved.member
    const user = resolved.user

    // Fetch UserProfile if the user is not a bot.
    let profile
    if (!user.bot) {
      await message.status('progress', 'Fetching user\'s profile\u2026')
      profile = await user.fetchProfile().catch(() => {})
    }

    // Check whether the keyword was a mention or not.
    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword)

    // Get user's avatar to be used in the embed.
    const thumbnail = user.displayAvatarURL({ size: 256 })
    const avatarURL = user.displayAvatarURL({ size: 2048 })

    // Account Information field.
    const embed = {
      fields: [
        {
          name: 'Account Information',
          value: stripIndent`
              •  **ID:** ${user.id}
              •  **Status:** ${user.presence.status}
              •  **Mention:** ${user.toString()}
              •  **Created on:** ${this.client.util.formatFromNow(user.createdAt)}
            `
        }
      ]
    }

    // Account Information field: Bot for bots, Nitro and Mutual guilds for regular users.
    if (user.bot) {
      embed.fields[0].value += '\n•  **Bot:** yes'
    } else if (profile) {
      embed.fields[0].value += `\n•  **Nitro${profile.premiumSince ? ' since' : ''}:** ${profile.premiumSince ? this.client.util.formatFromNow(profile.premiumSince) : 'no'}`
      if (user.id !== message.author.id)
        embed.fields[0].value += `\n•  **Mutual guilds:** ${profile.mutualGuilds.size.toLocaleString() || '0'}`
    } else {
      embed.fields[0].value += '\n•  Could not load profile information. Try again?'
    }

    embed.fields[0].value += `\n•  **Avatar:** ${avatarURL
      ? `[${this.client.util.getHostName(avatarURL)}](${avatarURL})`
      : 'N/A'}`

    // Activity message (in embed description).
    if (user.presence.activity)
      embed.description = this.formatActivityMessage(user.presence.activity)

    // Guild Membership field.
    if (member) {
      embed.fields.push(
        {
          name: 'Guild Membership',
          value: stripIndent`
              •  **Guild:** ${escapeMarkdown(member.guild.name)} (ID: ${member.guild.id})
              •  **Nickname:** ${member.nickname ? escapeMarkdown(member.nickname) : 'N/A'}
              •  **Joined on:** ${this.client.util.formatFromNow(member.joinedAt)}
            `
        }
      )

      const roles = member.roles.array() // Get an array instance of the Collection.
        .slice(0, -1) // Slice @everyone role.
        .sort((a, b) => b.position - a.position) // Sort by their positions in the Guild.
        .map(role => escapeMarkdown(role.name)) // Escape markdown from their names.

      embed.fields.push(
        {
          name: `Guild Roles [${roles.length}]`,
          value: roles.length ? roles.join(', ') : 'N/A'
        }
      )
    } else if (message.guild) {
      // If the command is being used in a Guild but the target user is not part of the said Guild.
      embed.fields.push(
        {
          name: 'Guild Membership',
          value: '*This user is not a member of the currently viewed guild.*'
        }
      )
    }

    // Message content (the thing being displayed above the embed).
    let content = 'My information:'
    if (mention)
      content = `${(member || user).toString()}'s information:`
    else if (args.keyword)
      content = `Information of the user matching keyword \`${args.keyword}\`:`

    // Options for the embed.
    embed.thumbnail = thumbnail
    embed.color = (member && member.displayColor !== 0) ? member.displayColor : null
    embed.author = {
      name: user.tag,
      icon: thumbnail
    }
    embed.footer = this.selfdestruct(true)

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }

  formatActivityMessage (activity) {
    const prefix = activity.details && activity.details !== activity.name ? `${activity.details} on ` : ''
    return `${this.client.util.formatActivityType(activity.type)} ${prefix}**${activity.name}**`
  }
}

module.exports = UserInfoCommand
