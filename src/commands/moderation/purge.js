const LCommand = require('./../../struct/LCommand')

class PurgeCommand extends LCommand {
  constructor () {
    super('purge', {
      aliases: ['purge'],
      description: 'Deletes a certain number of messages.',
      split: 'sticky',
      args: [
        {
          id: 'reason',
          match: 'option',
          flag: ['--reason=', '-r='],
          description: 'Reason for purging.'
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
      usage: 'purge [--reason=] [amount] [--before=]'
    })
  }

  async run (message, args) {
    const limit = Math.min(args.amount, 100)
    await message.status('progress', `Fetching the last ${limit} messages\u2026`)
    let messages = await message.channel.messages.fetch({
      limit,
      before: args.before || message.id
    })

    if (!message.guild || !this.client.util.hasPermissions(message.channel, 'MANAGE_MESSAGES'))
      messages = messages.filter(m => m.author.id === this.client.user.id)

    if (!messages.size)
      return message.status('error', 'There are no messages that you can purge.')

    await message.status('progress', `Purging ${messages.size} message${messages.size !== 1 ? 's' : ''}\u2026`)
    await Promise.all(messages.map(m => m.delete({ reason: args.reason })))

    return message.status('success', `Purged \`${messages.size}\` message${messages.size !== 1 ? 's' : ''}!`, this.handler.purgeCommandsTimeout)
  }
}

module.exports = PurgeCommand
