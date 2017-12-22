const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util
const { stripIndent } = require('common-tags')

const VERIFICATION_LEVELS = [
  'None',
  'Low - Must have verified email',
  'Medium - Registered on Discord for longer than 5 minutes',
  'High - A member of the server for longer than 10 minutes',
  'Insane - Must have verified phone'
]

const EXPLICIT_CONTENT_FILTERS = [
  'No scan',
  'Scan from members without a role',
  'Scan from all members'
]

const NOTIFICATIONS = {
  EVERYTHING: 'All messages',
  MENTIONS: 'Only @mentions',
  NOTHING: 'Nothing',
  INHERIT: 'Inherit preference from parent'
}

class GuildInfoCommand extends Command {
  constructor () {
    super('guildinfo', {
      aliases: ['guildinfo', 'ginfo', 'guild'],
      description: 'Shows information of the currently viewed or a specific guild.',
      args: [
        {
          id: 'refresh',
          match: 'flag',
          prefix: ['--refresh'],
          description: 'Refresh guild members (should be used in large guilds).'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you want to display the information of.'
        }
      ],
      options: {
        usage: 'guildinfo [--refresh] [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (!message.guild && !args.keyword) {
      return message.status.error('You must specify a guild name when running this command outside of a guild!')
    }

    let guild = message.guild

    // Assert Guild.
    if (args.keyword) {
      guild = await this.client.util.assertGuild(args.keyword)
    }

    if (args.refresh) {
      // Refresh GuildMemberStore.
      await message.status.progress('Refreshing guild members\u2026')
      await guild.members.fetch()
    }

    const iconURL = guild.iconURL({ size: 256 })
    const splashURL = guild.splashURL({ size: 2048 })

    const categories = guild.channels.filter(c => c.type === 'category')
    const text = guild.channels.filter(c => c.type === 'text')
    const voice = guild.channels.filter(c => c.type === 'voice')
    const online = guild.members.filter(m => m.presence.status !== 'offline')

    const embed = {
      title: guild.name,
      description: `I joined this server ${this.client.util.fromNow(guild.me.joinedAt)}.`,
      fields: [
        {
          name: 'Information',
          value: stripIndent`
              •  **ID:** ${guild.id}
              •  **Owner:** ${guild.owner ? `${escapeMarkdown(guild.owner.user.tag)} (ID: ${guild.owner.id})` : guild.ownerID}
              •  **Created:** ${this.client.util.formatFromNow(guild.createdAt)}
              •  **Region:** ${guild.region}
              •  **Verification level:** ${VERIFICATION_LEVELS[guild.verificationLevel]}
              •  **Explicit content filter:** ${EXPLICIT_CONTENT_FILTERS[guild.explicitContentFilter]}
              •  **System channel:** ${guild.systemChannel ? `${guild.systemChannel.name} (ID: ${guild.systemChannel.id})` : 'N/A'}
            `
        },
        {
          name: 'Statistics',
          value: stripIndent`
              •  **Channels:** ${guild.channels.size} – ${categories.size} categor${categories.size === 1 ? 'y' : 'ies'}, ${text.size} text and ${voice.size} voice
              •  **Members:** ${guild.memberCount} - ${online.size} online
              •  **Roles:** ${guild.roles.size} - ${guild.me.roles.size} owned
          `
        },
        {
          name: 'Miscellaneous',
          value: stripIndent`
              •  **Notifications:** ${NOTIFICATIONS[guild.messageNotifications]}
              •  **Mobile push:** ${this.client.util.formatYesNo(guild.mobilePush)}
              •  **Muted:** ${this.client.util.formatYesNo(guild.muted)}
          `
        }
      ],
      thumbnail: iconURL
    }

    if (splashURL) {
      embed.fields[0].value += `\n•  **Splash image:** [${this.client.util.getHostName(splashURL)}](${splashURL})`
    }

    // Message content (the thing being displayed above the embed).
    let content = 'Informations of the currently viewed guild:'
    if (args.keyword) {
      content = `Informations of the guild which matched \`${args.keyword}\`:`
    }

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = GuildInfoCommand
