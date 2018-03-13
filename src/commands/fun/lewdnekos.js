const { Command } = require('discord-akairo')

class LewdNekosCommand extends Command {
  constructor () {
    super('lewdnekos', {
      aliases: ['lewdnekos', 'lewdneko', 'lewd', 'nekol'],
      description: 'An alias for "neko --lewd".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      options: {
        usage: 'lewdnekos [--upload]'
      }
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('nekos')
    if (nekoCommand) {
      args.lewd = true
      return nekoCommand.exec(message, args)
    } else {
      return message.status.error('Could not execute nekos command.')
    }
  }
}

module.exports = LewdNekosCommand
