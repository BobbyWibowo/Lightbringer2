const LCommand = require('./../../struct/LCommand')
const path = require('path')

const EMOJI_REGEX = /<a?:[a-zA-Z0-9_]+:(\d+)>/

class JumboCommand extends LCommand {
  constructor () {
    super('jumbo', {
      aliases: ['jumbo', 'j', 'enlarge', 'large'],
      description: 'Sends emojis as image attachments.',
      args: [
        {
          id: 'emojis',
          match: 'rest',
          description: 'Emojis (may contain a maximum of 10 emojis).'
        }
      ],
      usage: 'jumbo <emojis>',
      clientPermissions: ['ATTACH_FILES']
    })
  }

  async exec (message, args) {
    if (!args.emojis) {
      return message.status('error', `Usage: \`${this.usage}\`.`)
    }

    const files = args.emojis
      .split(' ')
      .map(s => {
        const match = EMOJI_REGEX.exec(s)
        if (match && match[1]) {
          const emoji = this.client.emojis.get(match[1])
          if (emoji) {
            return {
              attachment: emoji.url,
              name: path.basename(emoji.url)
            }
          }
        }
      })
      .filter(f => f)

    files.length = Math.min(10, files.length)

    if (!files.length) {
      return message.status('error', 'Could not parse message into emojis.')
    }

    await message.channel.send({ files })
    await message.delete()
  }
}

module.exports = JumboCommand
