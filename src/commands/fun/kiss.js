const LCommand = require('./../../struct/LCommand')

class KissCommand extends LCommand {
  constructor () {
    super('kiss', {
      aliases: ['kisses', 'kissu', 'kiss'],
      description: 'Kisses someone using random GIFs from nekos.life.',
      usage: 'hug <@mention>',
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size)
      return message.status('error', '@mention someone to kiss.')

    const result = await this.client.util.fetch('https://nekos.life/api/v2/img/kiss')

    await message.edit(`*kisses ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = KissCommand
