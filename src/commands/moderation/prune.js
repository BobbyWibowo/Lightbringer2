const { Command } = require('discord-akairo')

class PruneCommand extends Command {
  constructor () {
    super('prune', {
      aliases: ['prune', 'delete'],
      description: 'Deletes a certain number of messages sent by you.',
      args: [
        {
          id: 'amount',
          type: 'integer',
          description: 'Number of messages to delete.',
          default: 1
        }
      ],
      options: {
        usage: 'prune [amount]'
      }
    })
  }

  async exec (message, args) {
    let messages = await message.channel.messages.fetch({
      limit: Math.min(args.amount, 100),
      before: message.id
    })

    messages = messages.filter(m => m.author.id === this.client.user.id)

    if (!messages.size) {
      return message.status.error('There are no messages that you can prune.')
    }

    await message.status.progress(`Pruning ${messages.size} message${messages.size !== 1 ? 's' : ''}\u2026`)
    await Promise.all(messages.map(m => m.delete()))

    return message.status.success(`Pruned \`${messages.size}\` message${messages.size !== 1 ? 's' : ''}!`, 3000)
  }
}

module.exports = PruneCommand
