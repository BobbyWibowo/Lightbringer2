const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch')

class PatCommand extends Command {
  constructor () {
    super('pat', {
      aliases: ['pats', 'pat'],
      description: 'Pats someone using random GIFs from nekos.life'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention someone to pat!')
    }

    const result = await snekfetch
      .get('https://nekos.life/api/pat')
      .set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

    await message.edit(`*pats ${message.mentions.users.first()}* \u2026 ${result.body.url}`)
  }
}

module.exports = PatCommand
