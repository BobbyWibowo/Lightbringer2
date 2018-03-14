const { Command } = require('discord-akairo')

class DogsCommand extends Command {
  constructor () {
    super('dogs', {
      aliases: ['dogs', 'dog'],
      description: 'An alias for "animals dog".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      options: {
        usage: 'dogs [--upload]',
        hidden: true
      }
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('animals')
    if (nekoCommand) {
      args.animal = 'dog'
      return nekoCommand.exec(message, args)
    } else {
      return message.status.error('Could not execute animals command.')
    }
  }
}

module.exports = DogsCommand
