const { Command } = require('discord-akairo')

class FlushCommand extends Command {
  constructor () {
    super('flush', {
      aliases: ['flush'],
      description: 'Deletes a certain number of messages sent by bots.',
      split: 'sticky',
      args: [
        {
          id: 'amount',
          type: 'integer',
          description: 'Number of messages to delete.',
          default: 1
        },
        {
          id: 'reason',
          match: 'prefix',
          prefix: '--reason=',
          description: 'Reason for flushing.'
        }
      ]
    })
  }

  async exec (message, args) {
    if (!message.guild || !this.client.util.hasPermission(message.channel, 'MANAGE_MESSAGES')) {
      return message.status.error('You do not have permission to delete messages sent by someone else!')
    }

    let messages = await message.channel.messages.fetch({
      limit: Math.min(args.amount, 100),
      before: message.id
    })

    messages = messages.filter(m => m.author.bot)

    await message.status.progress(`Flushing ${messages.size} message(s)\u2026`)
    await Promise.all(messages.map(m => m.delete({ reason: args.reason })))

    return message.status.success(`Flushed \`${messages.size}\` message(s)!`, 3000)
  }
}

module.exports = FlushCommand
