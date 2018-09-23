const LCommand = require('./../../struct/LCommand')

class PatCommand extends LCommand {
  constructor () {
    super('pat', {
      aliases: ['pats', 'pat'],
      description: 'Pats someone using random GIFs from nekos.life.',
      usage: 'hug <@mention>',
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status('error', '@mention someone to pat.')
    }

    const result = await this.client.util.fetch('https://nekos.life/api/v2/img/pat')

    await message.edit(`*pats ${message.mentions.users.first()}*`, {
      embed: this.client.util.embed({
        image: result.body.url
      })
    })
  }
}

module.exports = PatCommand
