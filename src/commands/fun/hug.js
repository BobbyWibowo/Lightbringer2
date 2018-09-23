const LCommand = require('./../../struct/LCommand')

class HugCommand extends LCommand {
  constructor () {
    super('hug', {
      aliases: ['hugs', 'huggu', 'hug'],
      description: 'Hugs someone using random GIFs from nekos.life.',
      usage: 'hug <@mention>',
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status('error', '@mention someone to hug.')
    }

    const result = await this.client.util.fetch('https://nekos.life/api/v2/img/hug')

    await message.edit(`*hugs ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = HugCommand
