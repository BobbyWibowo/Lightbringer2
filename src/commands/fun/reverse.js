const LCommand = require('./../../struct/LCommand')

class ReverseCommand extends LCommand {
  constructor () {
    super('reverse', {
      aliases: ['reverse'],
      description: 'Reverses the text input.',
      split: 'sticky',
      args: [
        {
          id: 'new',
          match: 'flag',
          flag: ['--new', '-n'],
          description: 'Sends the result as a new message instead of editing the command message.'
        },
        {
          id: 'prefix',
          match: 'option',
          flag: ['--prefix=', '-p='],
          description: 'Sets the prefix of the new message (this option will forcibly enables "--new" flag).'
        },
        {
          id: 'delete',
          match: 'flag',
          flag: ['--delete', '-d'],
          description: 'Deletes the new message if using "--new" flag.'
          // If you want to use t!reverse command (Tatsumaki bot), you can
          // do something like: "reverse -p=t!reverse -d reverse this text"
          // just for fun - since Tatsumaki doesn't have a public "say" command
        },
        {
          id: 'content',
          match: 'rest'
        }
      ],
      usage: 'reverse [ < --new | --prefix= > [--delete] ] <content>'
    })
  }

  async run (message, args) {
    if (!args.content)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    const content = args.content.split('').reverse().join('')

    if (args.new || args.prefix) {
      const newMessage = await message.channel.send((args.prefix ? `${args.prefix} ` : '') + content)
      await message.delete()
      if (args.delete)
        await newMessage.delete()
    } else {
      await message.edit(content)
    }
  }
}

module.exports = ReverseCommand
