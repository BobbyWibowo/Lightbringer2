const { Command } = require('discord-akairo')

class JumboCommand extends Command {
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
      options: {
        usage: 'jumbo <emojis>'
      },
      clientPermissions: ['ATTACH_FILES']
    })
  }

  async exec (message, args) {
    if (!args.emojis) {
      return message.status.error(`Usage: \`${this.options.usage}\`.`)
    }

    let files = args.emojis
      .split(' ')
      .map(s => {
        const match = /<a?:\w+?:(\d+?)>/.exec(s)
        if (match && match[1]) {
          const emoji = this.client.emojis.get(match[1])
          if (emoji) {
            return {
              attachment: emoji.url,
              name: `${emoji.name}-${emoji.id}.png`
            }
          }
        }
      })
      .filter(f => f)

    files.length = Math.min(10, files.length)

    if (!files.length) {
      return message.status.error('Could not parse message into emojis!')
    }

    await message.channel.send({ files })
    await message.delete()
  }
}

module.exports = JumboCommand
