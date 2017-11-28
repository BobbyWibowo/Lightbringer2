const { Command } = require('discord-akairo')

class ReverseCommand extends Command {
  constructor () {
    super('reverse', {
      aliases: ['reverse'],
      description: 'Reverses the text input.',
      split: 'sticky',
      args: [
        {
          id: 'content',
          match: 'rest'
        },
        {
          id: 'new',
          match: 'flag',
          prefix: ['--new', '-n'],
          description: 'Sends the result as a new message instead of editing the command message.'
        },
        {
          id: 'prefix',
          match: 'prefix',
          prefix: ['--prefix='],
          description: 'Sets the prefix of the new message (this option will forcibly enables `--new` flag).'
        },
        {
          id: 'delete',
          match: 'flag',
          prefix: ['--delete', '-d'],
          description: 'Deletes the new message if using `--new` flag.'
          // If you want to use t!reverse command (Tatsumaki bot), you can
          // do something like: "reverse --prefix=t!reverse -d reverse this text"
          // just for fun - since Tatsumaki doesn't have public say command
        }
      ]
    })
  }

  async exec (message, args) {
    const content = args.content.split('').reverse().join('')

    if (args.new || args.prefix) {
      const newMessage = await message.channel.send((args.prefix ? `${args.prefix} ` : '') + content)
      await message.delete()
      if (args.delete) {
        await newMessage.delete()
      }
    } else {
      await message.edit(content)
    }
  }
}

module.exports = ReverseCommand
