const LCommand = require('./../../struct/LCommand')

class CountrCommand extends LCommand {
  constructor () {
    super('countr', {
      aliases: ['countr', 'n'],
      description: 'Send a new message containing the next count for the current Countr channel.'
    })
  }

  async exec (message) {
    // We catch all functions that attempts to manipulate the current message then do nothing
    // as we expect that the message will be deleted by Countr
    const topic = message.channel.topic
    const match = topic.match(/^\*\*next count:\*\* (\d*)/i)
    if (!match) return message.status('error', 'Could not parse next count from channel\'s topic.').catch(() => {})
    await message.channel.send(parseInt(match[1]))
    return message.delete().catch(() => {})
  }
}

module.exports = CountrCommand
