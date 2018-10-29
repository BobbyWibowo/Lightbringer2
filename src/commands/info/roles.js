const LCommand = require('./../../struct/LCommand')

class RolesCommand extends LCommand {
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
      usage: 'roles [--brief] [keyword]',
      selfdestruct: 60,
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

    const roles = guild.roles.array() // Get an array instance of the Collection.
      // .slice(1) // Slice @everyone role.
      .sort((a, b) => b.position - a.position) // Sort by their positions in the Guild.

    const embed = {
      title: `${guild.name} [${roles.length}]`,
      color
    }

    const char = '\n'
    if (args.brief) {
      embed.description = roles
        .map(r => `${r.position === 0 ? '\\' : ''}${r.name}`)
        .join(char)
    } else {
      embed.description = roles
        .map(r => {
          if (r.position === 0) { return `\\${r.name}` }
          return `${r.name} – ${r.members.size} member${r.members.size === 1 ? '' : 's'}`
        })
        .join(char)
      embed.footer = `Use "memfetch" to refresh members cache | ${this.selfdestruct(true)}`
    }

    let content = 'Roles of the currently viewed guild:'
    if (args.keyword) {
      content = `Roles of the guild matching keyword \`${args.keyword}\`:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**Guild ID:** ${guild.id}\n${args.brief ? '' : '\n'}`,
      char
    })
  }
}

module.exports = RolesCommand
