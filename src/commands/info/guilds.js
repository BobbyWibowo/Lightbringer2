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
          id: 'brute',
          match: 'flag',
          prefix: ['--brute'],
          description: 'Brute mode, only usable if the specified user is a bot account. This will try to fetch member with the same ID from all of your guilds, which means this will make an API call for EVERY guild. The more guilds you have, the more time it will consume, and the more likely it is for you to be ratelimited. Please do not use this too often.'
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

    let diff
    let guilds = this.client.guilds
    if (!self) {
      if (user.bot) {
        if (args.brute) {
          await message.status('progress', 'Fetching user from all the guilds which you are a member of\u2026')
          diff = process.hrtime()
        }
        // This is not 100% reliable when not using brute mode.
        guilds = await this.client.util.fetchMutualGuilds(user.id, args.brute)
        if (args.brute && diff) {
          diff = process.hrtime(diff)
        }
      } else {
        await message.status('progress', 'Fetching user\'s profile\u2026')
        const profile = await user.fetchProfile()
        guilds = profile.mutualGuilds
      }
    }

    // Check whether the keyword was a mention or not.
    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword)

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

    if (user.bot) {
      if (args.brute) {
        embed.footer = `Time taken with brute mode: ${this.client.util.formatTimeNs(diff[0] * 1e9 + diff[1])}.`
      } else {
        embed.footer = 'The specified user is a bot, so the result may not be reliable.'
      }
    }

    let content = 'My guilds:'
    if (mention) {
      content = `Mutual guilds with ${user.toString()}:`
    } else if (args.keyword) {
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
