const LCommand = require('./../../struct/LCommand')

class DogsCommand extends LCommand {
  constructor () {
    super('dogs', {
      aliases: ['dogs', 'doggo', 'dog', 'woof'],
      description: 'An alias for "animals dog".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      usage: 'dogs [--upload]',
      hidden: true
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('animals')
    if (nekoCommand) {
      args.animal = 'dog'
      return nekoCommand.exec(message, args)
    } else {
      return message.status('error', 'Could not execute animals command.')
    }
  }
}

module.exports = DogsCommand
