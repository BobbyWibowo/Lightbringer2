const LCommand = require('./../../struct/LCommand')

class GenerateCommand extends LCommand {
  constructor () {
    super('generate', {
      aliases: ['generate', 'gen'],
      description: 'Generate an MD file containing brief information of all non-hidden commands. The result will be used for the GitHub repository.'
    })
  }

  async run (message) {
    // TODO: ...
    return message.status('error', 'Work in progress.')
  }
}

module.exports = GenerateCommand
