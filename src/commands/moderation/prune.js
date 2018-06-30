const LCommand = require('./../../struct/LCommand')

class PruneCommand extends LCommand {
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
        },
        {
          id: 'before',
          match: 'option',
          flag: ['--before=', '-b='],
          description: 'An ID of the message which will be used as an anchor. If this is set, it will prune X messages before it, but not itself. By default, this will be set to the command message.'
        }
      ],
      usage: 'prune [amount] [--before=]'
    })
  }

  async exec (message, args) {
    let messages = await message.channel.messages.fetch({
      limit: Math.min(args.amount, 100),
      before: args.before || message.id
    })

    messages = messages.filter(m => m.author.id === this.client.user.id)

    if (!messages.size) {
      return message.status('error', 'There are no messages that you can prune.')
    }

    await message.status('progress', `Pruning ${messages.size} message${messages.size !== 1 ? 's' : ''}\u2026`)
    await Promise.all(messages.map(m => m.delete()))

    return message.status('success', `Pruned \`${messages.size}\` message${messages.size !== 1 ? 's' : ''}!`, this.handler.purgeCommandsTimeout)
  }
}

module.exports = PruneCommand
