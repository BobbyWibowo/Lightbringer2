const LCommand = require('./../../struct/LCommand')

class UserIdCommand extends LCommand {
  constructor () {
    super('userid', {
      aliases: ['userid', 'uid'],
      description: 'Shows yours or another user\'s ID.',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the ID of.'
        }
      ],
      usage: 'userid [keyword]'
    })
  }

  async exec (message, args) {
    // Assert GuildMember or User.
    const memberSource = message.guild || null
    const resolved = await this.client.util.assertMemberOrUser(args.keyword, memberSource, true)
    const user = resolved.user

    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword)

    await message.edit(`${mention ? user : user.tag}'s ID:\n${user.id}`)
  }
}

module.exports = UserIdCommand
