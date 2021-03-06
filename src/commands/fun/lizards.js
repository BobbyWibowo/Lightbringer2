const LCommand = require('./../../struct/LCommand')

class LizardsCommand extends LCommand {
  constructor () {
    super('lizards', {
      aliases: ['lizards', 'lizard'],
      description: 'An alias for "animals lizard".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      usage: 'lizards [--upload]',
      hidden: true
    })
  }

  async run (message, args) {
    const nekoCommand = this.handler.modules.get('animals')
    if (nekoCommand) {
      args.animal = 'lizard'
      return nekoCommand.exec(message, args)
    } else {
      return message.status('error', 'Could not execute animals command.')
    }
  }
}

module.exports = LizardsCommand
