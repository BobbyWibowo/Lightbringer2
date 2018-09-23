const LCommand = require('./../../struct/LCommand')

class BirdsCommand extends LCommand {
  constructor () {
    super('birds', {
      aliases: ['birds', 'bird', 'birb'],
      description: 'An alias for "animals bird".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      usage: 'birds [--upload]',
      hidden: true
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('animals')
    if (nekoCommand) {
      args.animal = 'bird'
      return nekoCommand.exec(message, args)
    } else {
      return message.status('error', 'Could not execute animals command.')
    }
  }
}

module.exports = BirdsCommand
