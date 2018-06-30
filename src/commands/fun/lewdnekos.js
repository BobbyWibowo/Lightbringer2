const LCommand = require('./../../struct/LCommand')

class LewdNekosCommand extends LCommand {
  constructor () {
    super('lewdnekos', {
      aliases: ['lewdnekos', 'lewdneko', 'lewdnyaa', 'lewd', 'nekol'],
      description: 'An alias for "neko --lewd".',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        }
      ],
      usage: 'lewdnekos [--upload]',
      hidden: true
    })
  }

  async exec (message, args) {
    const nekoCommand = this.handler.modules.get('nekos')
    if (nekoCommand) {
      args.lewd = true
      return nekoCommand.exec(message, args)
    } else {
      return message.status('error', 'Could not execute nekos command.')
    }
  }
}

module.exports = LewdNekosCommand
