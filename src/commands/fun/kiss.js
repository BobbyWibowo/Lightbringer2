const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch')

class KissCommand extends Command {
  constructor () {
    super('kiss', {
      aliases: ['kisses', 'kiss'],
      description: 'Kisses someone using random GIFs from nekos.life'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to kiss!')
    }

    const result = await snekfetch
      .get('https://nekos.life/api/kiss')
      .set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

    await message.edit(`*kisses ${message.mentions.users.first()}* \u2026 ${result.body.url}`)
  }
}

module.exports = KissCommand
