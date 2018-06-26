const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class UserRolesCommand extends Command {
  constructor () {
    super('userroles', {
      aliases: ['userroles', 'uroles'],
      description: 'Lists yours or another user\'s roles.',
      args: [
        {
          id: 'guild',
          match: 'option',
          flag: ['--guild=', '-g='],
          description: 'Tries to fetch member roles from a specific guild instead.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the roles of.'
        }
      ],
      options: {
        usage: 'userroles [--guild=] [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (!message.guild && !args.guild) {
      return message.status('error', 'You must specify a guild name when running this command outside of a guild.')
    }

    let guild = message.guild

    // Assert Guild.
    if (args.guild) {
      guild = await this.client.util.assertGuild(args.guild)
    }

    // Assert GuildMember,
    const member = await this.client.util.assertMember(args.keyword, guild, true, true)

    // Check whether the keyword was a mention or not.
    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword)

    // Get user's avatar to be used in the embed.
    const thumbnail = member.user.displayAvatarURL({ size: 256 })

    const roles = member.roles
      .array() // Get an array instance of the Collection.
      .slice(1) // Slice @everyone role.
      .sort((a, b) => b.position - a.position) // Sort by their positions in the Guild.
      .map(role => escapeMarkdown(role.name)) // Escape markdown from their names.

    const char = ', '

    // Options for the embed.
    const embed = {
      description: roles.length ? roles.join(char) : 'N/A',
      thumbnail,
      color: (member && member.displayColor !== 0) ? member.displayColor : null,
      author: {
        name: member.user.tag,
        icon: thumbnail
      }
    }

    // Message content (the thing being displayed above the embed).
    let content = 'My roles:'
    if (mention) {
      content = `${member.toString()}'s roles:`
    } else if (args.keyword) {
      content = `Roles of the user matching keyword \`${args.keyword}\`:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      flag: `**Guild:** ${escapeMarkdown(guild.name)} (ID: ${guild.id})\n\n`,
      code: args.brief ? '' : null,
      char
    })
  }
}

module.exports = UserRolesCommand
