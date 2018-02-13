const { Command } = require('discord-akairo')

class HugCommand extends Command {
  constructor () {
    super('hug', {
      aliases: ['hugs', 'hug'],
      description: 'Hugs someone using random GIFs from nekos.life.',
      options: {
        usage: 'hug <@mention>'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to hug.')
    }

    const result = await this.client.util.snek('https://nekos.life/api/hug', {
      headers: {
        Key: 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf'
      }
    })

    await message.edit(`*hugs ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = HugCommand
