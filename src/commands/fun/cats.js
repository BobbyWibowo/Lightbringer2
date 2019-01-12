const LCommand = require('./../../struct/LCommand')

class CatsCommand extends LCommand {
  constructor () {
    super('cats', {
      aliases: ['cats', 'catto', 'cat'],
      description: 'An alias for "animals cat".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      usage: 'cats [--upload]',
      hidden: true
    })
  }

  async run (message, args) {
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
