const { Command } = require('discord-akairo')

class PatCommand extends Command {
  constructor () {
    super('pat', {
      aliases: ['pats', 'pat'],
      description: 'Pats someone using random GIFs from nekos.life.',
      options: {
        usage: 'hug <@mention>'
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to pat.')
    }

    const result = await this.client.util.snek('https://nekos.life/api/v2/img/pat')

    await message.edit(`*pats ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = PatCommand
