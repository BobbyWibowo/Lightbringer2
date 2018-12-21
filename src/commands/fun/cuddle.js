const LCommand = require('./../../struct/LCommand')

class CuddleCommand extends LCommand {
  constructor () {
    super('cuddle', {
      aliases: ['cuddles', 'cuddle'],
      description: 'Cuddles someone using random GIFs from nekos.life.',
      usage: 'cuddle <@mention>',
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size)
      return message.status('error', '@mention someone to cuddle.')

    const result = await this.client.util.fetch('https://nekos.life/api/v2/img/cuddle')

    await message.edit(`*cuddles ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = CuddleCommand
