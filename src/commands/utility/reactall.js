const LCommand = require('./../../struct/LCommand')

class ReactAllCommand extends LCommand {
  constructor () {
    super('reactall', {
      aliases: ['reactall', 'ra'],
      description: 'React to a message with all of its currently active reactions.',
      args: [
        {
          id: 'guild',
          match: 'option',
          flag: ['--guild=', '-g='],
          description: 'If input for channel option is search keyword, set from which guild it will try to look for the channel.'
        },
        {
          id: 'channel',
          match: 'phrase',
          description: 'Channel containing the message. If undefined, use the channel in which the command was executed from.'
        },
        {
          id: 'message',
          match: 'phrase',
          description: 'ID of the message. If undefined, use the last message in the channel.'
        }
      ],
      usage: 'reactall [--guild=] [channel] [message]'
    })
  }

  async exec (message, args) {
    const guild = args.guild || message.guild || null

    let channel = message.channel
    if (args.channel) {
      channel = await this.client.util.assertChannel(args.channel, guild)
    }

    let msg = null
    if (args.message) {
      await message.status('progress', `Fetching message with ID ${args.message} from #${channel.name}\u2026`)
      msg = await channel.messages.fetch(args.message)
    } else if (channel.id === message.channel.id) {
      // If in the same channel, use the message before the command
      const lastMsgs = channel.messages.last(2)
      if (lastMsgs.length === 2) {
        msg = lastMsgs[0]
      } else {
        await message.status('progress', `Fetching last message from #${channel.name}\u2026`)
        msg = await channel.messages.fetch({
          limit: 1,
          before: message.id
        }).then(msgs => msgs.first())
      }
    } else {
      // Otherwise, use the actual last message
      msg = channel.messages.last()
      if (!msg) {
        await message.status('progress', `Fetching last message from #${channel.name}\u2026`)
        msg = await channel.messages.fetch({
          limit: 1
        }).then(msgs => msgs.first())
      }
    }

    if (!msg) {
      return message.status('error', 'Unable to fetch any messages!')
    }

    const reactions = msg.reactions
      .filter(reaction => !reaction.me)

    if (!reactions.size) {
      return message.status('error', 'There are no active reactions that you haven\'t reacted to!')
    }

    await message.status('progress', `Reacting to ${reactions.size} reaction(s) in ${msg.author.tag}'s message\u2026`)
    await Promise.all(reactions.map(reaction => {
      return msg.react(reaction.emoji)
    }))
    return message.status('success', `Successfully reacted to ${reactions.size} active reaction(s) in ${msg.author.tag}'s message!`)
  }
}

module.exports = ReactAllCommand
