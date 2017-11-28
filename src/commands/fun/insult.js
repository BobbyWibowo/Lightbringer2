const { Command } = require('discord-akairo')
const { Insults } = require('../../util/Constants')

class InsultCommand extends Command {
  constructor () {
    super('insult', {
      aliases: ['insults', 'insult'],
      description: 'Insults some users.',
      options: {
        credits: 'Twentysix#5252'
      }
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention some people to insult!')
    }

    const content = message.mentions.users
      .map(m => `${m} ${Insults[Math.round(Math.random() * Insults.length)]}`)
      .join('\n')

    await message.edit(content)
  }
}

module.exports = InsultCommand
