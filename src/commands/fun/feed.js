const { Command } = require('discord-akairo')
const { Foods } = require('../../util/Constants')

class FeedCommand extends Command {
  constructor () {
    super('feed', {
      aliases: ['feed'],
      description: 'Forces an item down someone\'s throat'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention some people to feed!')
    }

    const content = message.mentions.users
      .map(m => `*forces ${Foods[Math.round(Math.random() * (Foods.length - 1))]} down ${m}'s throat*`)
      .join('\n')

    await message.edit(content)
  }
}

module.exports = FeedCommand
