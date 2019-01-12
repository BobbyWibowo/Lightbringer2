const LCommand = require('./../../struct/LCommand')

class FlushCommand extends LCommand {
  constructor () {
    super('flush', {
      aliases: ['flush'],
      description: 'Deletes a certain number of messages sent by bots.',
      split: 'sticky',
      args: [
        {
          id: 'reason',
          match: 'option',
          flag: ['--reason=', '-r='],
          description: 'Reason for flushing.'
        },
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
      usage: 'flush [--reason=] [amount] [--before=]'
    })
  }

  async run (message, args) {
    if (!message.guild || !this.client.util.hasPermissions(message.channel, 'MANAGE_MESSAGES'))
      return message.status('error', 'You do not have permission to delete messages sent by someone else.')

    const limit = Math.min(args.amount, 100)
    await message.status('progress', `Fetching the last ${limit} messages\u2026`)
    let messages = await message.channel.messages.fetch({
      limit,
      before: args.before || message.id
    })

    messages = messages.filter(m => m.author.bot)

    await message.status('progress', `Flushing ${messages.size} message${messages.size !== 1 ? 's' : ''}\u2026`)
    await Promise.all(messages.map(m => m.delete({ reason: args.reason })))

    return message.status('success', `Flushed \`${messages.size}\` message${messages.size !== 1 ? 's' : ''}!`, this.handler.purgeCommandsTimeout)
  }
}

module.exports = FlushCommand
