/**
 * ALERT: This command is using the extremely experimental multiSendEmbed() util function.
 * It has been tested with a role that had ~1000 members and it could send ~9 embeds
 * without errors, but still...
 */

const { Util } = require('discord.js')
const { Command } = require('discord-akairo')
const { escapeMarkdown } = Util

class InRoleCommand extends Command {
  constructor () {
    super('inrole', {
      aliases: ['inrole'],
      description: 'Lists members of a specific role.',
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
          description: 'The role that you want to display the members of.'
        }
      ],
      options: {
        usage: 'inrole [--guild=] <keyword>'
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

    const embed = {
      title: `${role.name} [${role.members.size}]`,
      description: role.members
        .map(m => escapeMarkdown(m.user.tag, true))
        .sort((a, b) => a.localeCompare(b))
        .join(', '),
      color: role.hexColor
    }

    // Message content (the thing being displayed above the embed).
    let content = `Members of the role which matched \`${args.keyword}\`:`
    if (mention) {
      content = `${role}'s members:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**Guild:** ${escapeMarkdown(role.guild.name)} (ID: ${role.guild.id})\n`,
      code: 'css',
      char: ', '
    })
  }
}

module.exports = InRoleCommand
