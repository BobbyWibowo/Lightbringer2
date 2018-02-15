const { Command } = require('discord-akairo')

class GuildsCommand extends Command {
  constructor () {
    super('guilds', {
      aliases: ['guildlist', 'guilds'],
      description: 'Lists all the guilds which you are a member of or all of your mutual guilds with a certain user.',
      args: [
        {
          id: 'brief',
          match: 'flag',
          prefix: ['--brief', '-b'],
          description: 'Brief list.'
        },
        {
          id: 'positionsort',
          match: 'flag',
          prefix: ['--positionsort', '--position', '-p'],
          description: 'Sort the guilds by their position in your client.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to list your mutual guilds of.'
        }
      ],
      options: {
        usage: 'guilds [--brief] [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    // Assert GuildMember or User.
    const memberSource = args.guild || message.guild || null
    const resolved = await this.client.util.assertMemberOrUser(args.keyword, memberSource, true)
    const user = resolved.user
    const self = user.id === this.client.user.id

    let guildStore = this.client.guilds
    if (!self) {
      if (user.bot) {
        return message.status.error('The specified guild is a bot. Fetching mutual guilds from them is not yet possible.')
      }
      await message.status.progress('Fetching user\'s profile\u2026')
      const profile = await user.fetchProfile()
      guildStore = profile.mutualGuilds
    }

    let guilds = guildStore

    if (args.positionsort) {
      // Sort guilds by their position descendingly.
      guilds = guilds.sort((a, b) => a.position - b.position)
    } else {
      // Sort guilds by their members count descendingly.
      // If the guilds have equal members count, sort by their name descendingly.
      guilds = guilds.sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name))
    }

    const embed = {
      title: `${user.tag} [${guilds.size}]`
    }

    let char
    if (args.brief) {
      char = ', '
      embed.description = guilds.map(g => g.name).join(char)
    } else {
      char = '\n'
      embed.description = guilds.map(g => {
        return `•  ${g.name} – ${g.members.size} member${g.members.size === 1 ? '' : 's'}`
      }).join(char)
    }

    let content = `My guilds:`
    if (args.keyword) {
      content = `Mutual guilds with user matching keyword \`${args.keyword}\`:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**User ID:** ${user.id}\n${args.brief ? '' : '\n'}`,
      code: args.brief ? '' : null,
      char
    })
  }
}

module.exports = GuildsCommand
