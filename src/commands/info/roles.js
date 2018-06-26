const { Command } = require('discord-akairo')

class RolesCommand extends Command {
  constructor () {
    super('roles', {
      aliases: ['rolelist', 'roles'],
      description: 'Lists roles of the currently viewed or a specific guild.',
      args: [
        {
          id: 'brief',
          match: 'flag',
          flag: ['--brief', '-b'],
          description: 'Brief list.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you want to list the roles of.'
        }
      ],
      options: {
        usage: 'roles [--brief] [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (!message.guild && !args.keyword) {
      return message.status('error', 'You must specify a guild name when running this command outside of a guild.')
    }

    let guild = message.guild

    // Assert Guild.
    if (args.keyword) {
      guild = await this.client.util.assertGuild(args.keyword)
    }

    const color = await this.client.guildColors.get(guild)

    // Sort roles by their position descendingly.
    const roles = guild.roles.sort((a, b) => b.position - a.position)

    const embed = {
      title: `${guild.name} [${roles.size}]`,
      color
    }

    let char
    if (args.brief) {
      char = ', '
      embed.description = roles.map(r => r.name).join(char)
    } else {
      char = '\n'
      embed.description = roles.map(r => {
        if (r.position === 0) {
          return `•  \\${r.name}`
        } else {
          return `•  ${r.name} – ${r.members.size} member${r.members.size === 1 ? '' : 's'}`
        }
      }).join(char)
      embed.footer = 'Consider running "membersfetch" command if members count seem incorrect.'
    }

    let content = 'Roles of the currently viewed guild:'
    if (args.keyword) {
      content = `Roles of the guild matching keyword \`${args.keyword}\`:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      flag: `**Guild ID:** ${guild.id}\n${args.brief ? '' : '\n'}`,
      code: args.brief ? '' : null,
      char
    })
  }
}

module.exports = RolesCommand
