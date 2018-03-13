const { Command } = require('discord-akairo')

class CuddleCommand extends Command {
  constructor () {
    super('cuddle', {
      aliases: ['cuddles', 'cuddle'],
      description: 'Cuddles someone using random GIFs from nekos.life.',
      options: {
        usage: 'cuddle <@mention>'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to cuddle.')
    }

    const result = await this.client.util.snek('https://nekos.life/api/v2/img/cuddle')

    await message.edit(`*cuddles ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = CuddleCommand
