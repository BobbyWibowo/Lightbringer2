const { Command } = require('discord-akairo')

class KissCommand extends Command {
  constructor () {
    super('kiss', {
      aliases: ['kisses', 'kiss'],
      description: 'Kisses someone using random GIFs from nekos.life.',
      options: {
        usage: 'hug <@mention>'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status('error', '@mention someone to kiss.')
    }

    const result = await this.client.util.snek('https://nekos.life/api/v2/img/kiss')

    await message.edit(`*kisses ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = KissCommand
