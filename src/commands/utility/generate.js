const { Command } = require('discord-akairo')

class GenerateCommand extends Command {
  constructor () {
    super('generate', {
      aliases: ['generate', 'gen'],
      description: 'Generate an MD file containing brief information of all non-hidden commands. The result will be used for the GitHub repository.'
    })
  }

  async exec (message) {
    // TODO: ...
    return message.status('error', 'Work in progress.')
  }
}

module.exports = GenerateCommand
