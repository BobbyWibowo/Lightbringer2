const { Insults } = require('../../util/Constants')
const LCommand = require('./../../struct/LCommand')

class InsultCommand extends LCommand {
  constructor () {
    super('insult', {
      aliases: ['insults', 'insult'],
      description: 'Insults some users.',
      usage: 'insult @mention-1 [@mention-2] [...] [@mention-n]',
      credits: 'Twentysix#5252'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size)
      return message.status('error', '@mention some people to insult.')

    const content = message.mentions.users
      .map(m => `${m} ${Insults[Math.round(Math.random() * Insults.length)]}`)
      .join('\n')

    await message.edit(content)
  }
}

module.exports = InsultCommand
