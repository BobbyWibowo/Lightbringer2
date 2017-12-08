const { Command } = require('discord-akairo')

class PurgeCommand extends Command {
  constructor () {
    super('purge', {
      aliases: ['purge'],
      description: 'Deletes a certain number of messages.',
      split: 'sticky',
      args: [
        {
          id: 'reason',
          match: 'prefix',
          prefix: ['--reason=', '-r='],
          description: 'Reason for purging.'
        },
        {
          id: 'amount',
          type: 'integer',
          description: 'Number of messages to delete.',
          default: 1
        }
      ],
      options: {
        usage: 'purge [--reason=] [amount]'
      }
    })
  }

  async exec (message, args) {
    let messages = await message.channel.messages.fetch({
      limit: Math.min(args.amount, 100),
      before: message.id
    })

    if (!message.guild || !this.client.util.hasPermissions(message.channel, 'MANAGE_MESSAGES')) {
      messages = messages.filter(m => m.author.id === this.client.user.id)
    }

    if (!messages.size) {
      return message.status.error('There are no messages that you can purge!')
    }

    await message.status.progress(`Purging ${messages.size} message(s)\u2026`)
    await Promise.all(messages.map(m => m.delete({ reason: args.reason })))

    return message.status.success(`Purged \`${messages.size}\` message(s)!`, 3000)
  }
}

module.exports = PurgeCommand
