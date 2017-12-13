const { Command } = require('discord-akairo')

class UserIdCommand extends Command {
  constructor () {
    super('userid', {
      aliases: ['userid', 'uid'],
      description: 'Shows yours or another user\'s ID.',
      args: [
        {
          id: 'keyword',
          match: 'content',
          description: 'The user that you want to display the ID of.'
        }
      ],
      options: {
        usage: 'userid [keyword]'
      }
    })
  }

  async exec (message, args) {
    // Assert GuildMember or User.
    const memberSource = message.guild || null
    const resolved = await this.client.util.assertMemberOrUser(args.keyword, memberSource, true)
    const user = resolved.user

    const mention = this.client.util.isKeywordMentionable(args.keyword)

    await message.edit(`${mention ? user : user.tag}'s ID:\n${user.id}`)
  }
}

module.exports = UserIdCommand
