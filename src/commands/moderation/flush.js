const { Command } = require('discord-akairo')

class FlushCommand extends Command {
  constructor () {
    super('flush', {
      aliases: ['flush'],
      description: 'Deletes a certain number of messages sent by bots.',
      split: 'sticky',
      args: [
        {
          id: 'reason',
          match: 'prefix',
          prefix: ['--reason=', '-r='],
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
          match: 'prefix',
          prefix: ['--before=', '-b='],
          description: 'An ID of the message which will be used as an anchor. If this is set, it will prune X messages before it, but not itself. By default, this will be set to the command message.'
        }
      ],
      options: {
        usage: 'flush [--reason=] [amount]'
      }
    })
  }

  async exec (message, args) {
    if (!message.guild || !this.client.util.hasPermissions(message.channel, 'MANAGE_MESSAGES')) {
      return message.status.error('You do not have permission to delete messages sent by someone else.')
    }

    let messages = await message.channel.messages.fetch({
      limit: Math.min(args.amount, 100),
      before: args.before || message.id
    })

    messages = messages.filter(m => m.author.bot)

    await message.status.progress(`Flushing ${messages.size} message${messages.size !== 1 ? 's' : ''}\u2026`)
    await Promise.all(messages.map(m => m.delete({ reason: args.reason })))

    return message.status.success(`Flushed \`${messages.size}\` message${messages.size !== 1 ? 's' : ''}!`, 3000)
  }
}

module.exports = FlushCommand
