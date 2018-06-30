const { Foods } = require('../../util/Constants')
const LCommand = require('./../../struct/LCommand')

class FeedCommand extends LCommand {
  constructor () {
    super('feed', {
      aliases: ['feeds', 'feed'],
      description: 'Forces an item down someone\'s throat.',
      usage: 'feed @mention-1 [@mention-2] [...] [@mention-n]'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status('error', '@mention some people to feed.')
    }

    const content = message.mentions.users
      .map(m => `*forces ${Foods[Math.round(Math.random() * Foods.length)]} down ${m}'s throat*`)
      .join('\n')

    await message.edit(content)
  }
}

module.exports = FeedCommand
