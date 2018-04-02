const { Command } = require('discord-akairo')

class CatsCommand extends Command {
  constructor () {
    super('cats', {
      aliases: ['cats', 'cat'],
      description: 'An alias for "animals cat".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      options: {
        usage: 'cats [--upload]',
        hidden: true
      }
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('animals')
    if (nekoCommand) {
      args.animal = 'cat'
      return nekoCommand.exec(message, args)
    } else {
      return message.status('error', 'Could not execute animals command.')
    }
  }
}

module.exports = CatsCommand
