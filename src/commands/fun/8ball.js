const { Command } = require('discord-akairo')

class EightBallCommand extends Command {
  constructor () {
    super('8ball', {
      aliases: ['8ball', '8b'],
      description: 'Uses 8ball.delegator.com to ask the magic 8-ball for a question.',
      args: [
        {
          id: 'question',
          match: 'rest',
          description: 'The question that you would like to ask to 8-ball.'
        }
      ],
      options: {
        usage: '8ball <question>'
      }
    })
  }

  async exec (message, args) {
    if (!args.question) {
      return message.status.error('You must provide a question to ask.')
    }

    await message.status.progress('Asking the question to 8-ball\u2026')
    const result = await this.client.util.snek(`https://8ball.delegator.com/magic/JSON/${args.question}`)

    if (result.status !== 200) {
      return message.status.error('Could not retrieve answer from 8-ball.')
    }

    const magic = result.body.magic
    await message.edit(
      `🎱\u2000|\u2000**Question:** ${this.client.util.capitalizeFirstLetter(magic.question)}?\n\n` +
      `${magic.answer}.`
    )
  }
}

module.exports = EightBallCommand
