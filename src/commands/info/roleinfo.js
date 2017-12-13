const { Util } = require('discord.js')
const { Command } = require('discord-akairo')
const { escapeMarkdown } = Util
const { stripIndent } = require('common-tags')

class RoleInfoCommand extends Command {
  constructor () {
    super('roleinfo', {
      aliases: ['roleinfo', 'rinfo', 'role'],
      description: 'Shows information of a specific role.',
      args: [
        {
          id: 'guild',
          match: 'prefix',
          prefix: ['--guild=', '-g='],
          description: 'Tries to use role from a specific guild instead.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The role that you want to display the information of.'
        }
      ],
      options: {
        usage: 'roleinfo [--guild=] <keyword>'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (!args.keyword) {
      return message.status.error('You must specify a guild role name!')
    }

    const roleSource = args.guild || message.guild || null
    if (!roleSource) {
      return message.status.error('You must be in a guild to run this command without "--guild" flag!')
    }

    // Assert Role.
    const role = await this.client.util.assertRole(args.keyword, roleSource)

    // Refresh GuildMemberStore.
    await role.guild.members.fetch()

    // Check whether the keyword was a mention or not.
    const mention = this.client.util.isKeywordMentionable(args.keyword, 1)

    const online = role.members.filter(m => m.presence.status !== 'offline')

    const embed = {
      title: role.name,
      description: `**Guild:** ${escapeMarkdown(role.guild.name)} (ID: ${role.guild.id})`,
      fields: [
        {
          name: 'Information',
          value: stripIndent`
              •  **ID:** ${role.id}
              •  **Created:** ${this.client.util.formatFromNow(role.createdAt)}
              •  **Position:** ${role.guild.roles.size - role.position} out of ${role.guild.roles.size}
              •  **Members:** ${role.members.size} - ${online.size} online
            `
        },
        {
          name: 'Miscellaneous',
          value: stripIndent`
              •  **Hex color:** ${role.hexColor}
              •  **RGB color:** (${this.client.util.hexToRgb(role.hexColor).join(', ')})
              •  **Hoist:** ${this.client.util.formatYesNo(role.hoist)}
              •  **Managed:** ${this.client.util.formatYesNo(role.managed)}
              •  **Mentionable:** ${this.client.util.formatYesNo(role.mentionable)}
          `
        }
      ],
      color: role.hexColor
    }

    // Message content (the thing being displayed above the embed).
    let content = `Information of the role which matched \`${args.keyword}\`:`
    if (mention) {
      content = `${role}'s information:`
    }

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = RoleInfoCommand
