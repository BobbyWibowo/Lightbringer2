const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch')

class HugCommand extends Command {
  constructor () {
    super('hug', {
      aliases: ['hugs', 'hug'],
      description: 'Hugs someone using random GIFs from nekos.life'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to hug!')
    }

    const result = await snekfetch
      .get('https://nekos.life/api/hug')
      .set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

    await message.edit(`*hugs ${message.mentions.users.first()}* \u2026 ${result.body.url}`)
  }
}

module.exports = HugCommand
