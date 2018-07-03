const LCommand = require('./../../struct/LCommand')

class GuildsCommand extends LCommand {
  constructor () {
    super('guilds', {
      aliases: ['guildlist', 'guilds'],
      description: 'Lists all the guilds which you are a member of or all of your mutual guilds with a certain user.',
      args: [
        {
          id: 'brief',
          match: 'flag',
          flag: ['--brief', '-b'],
          description: 'Brief list.'
        },
        {
          id: 'positionsort',
          match: 'flag',
          flag: ['--positionsort', '--position', '-p'],
          description: 'Sort the guilds by their position in your client.'
        },
        {
          id: 'brute',
          match: 'flag',
          flag: ['--brute'],
          description: 'Brute mode. This will try to fetch member with matching ID from all of the guilds that you are a member of (which means this will make an API call for ALMOST EVERY guilds). The more guilds you have, the more time it will consume, and the more likely it is for you to be ratelimited. PLEASE DO NOT USE THIS TOO OFTEN. When this is not enabled, for bots, it will attempt to find their existence from every guild\'s cached members, which may not be accurate if they are offline (regular users will use the proper profile API instead).'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to list your mutual guilds of.'
        }
      ],
      usage: 'guilds [--brief] [--positionsort] [--brute] [keyword]',
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
      if (args.brute) {
        await message.status('progress', 'Fetching user from all the guilds which you are a member of\u2026')
        diff = process.hrtime()
        guilds = await this.client.util.fetchMutualGuilds(user.id, true)
        diff = process.hrtime(diff)
      } else if (user.bot) {
        // This may not be accurate without brute mode if the targeted user is offline.
        guilds = await this.client.util.fetchMutualGuilds(user.id, false)
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
        embed.footer = `Time taken with brute mode: ${this.client.util.formatHrTime(diff)}.`
      } else if (user.presence.status === 'offline') {
        embed.footer = 'The specified user is an offline bot, so the result may not be accurate.'
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
      flag: `**User ID:** ${user.id}\n${args.brief ? '' : '\n'}`,
      code: args.brief ? '' : null,
      char
    })
  }
}

module.exports = GuildsCommand
