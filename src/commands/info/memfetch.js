const LCommand = require('./../../struct/LCommand')

class MembersFetchCommand extends LCommand {
  constructor () {
    super('memfetch', {
      aliases: ['membersfetch', 'memfetch', 'fetch'],
      description: 'Fetches members of the currently viewed or a specific guild. This will update "member store" of the specified guild, which may help when listing members of a role or something similar. Do NOT run this command too often as it may trigger API ratelimits.',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you want to fetch the members of.'
        }
      ],
      usage: 'memfetch [keyword]'
    })
  }

  async exec (message, args) {
    if (!message.guild && !args.keyword)
      return message.status('error', 'You must specify a guild name when running this command outside of a guild.')

    let guild = message.guild

    // Assert Guild.
    if (args.keyword)
      guild = await this.client.util.assertGuild(args.keyword)

    await message.status('progress', 'Fetching guild members\u2026')
    await guild.members.fetch()

    return message.status('success', 'Members successfully fetched. Remember not to repeat this command too often on the same guild.')
  }
}

module.exports = MembersFetchCommand
