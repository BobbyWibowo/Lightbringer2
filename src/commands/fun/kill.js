const { Command } = require('discord-akairo')
const { Kills } = require('../../util/Constants')

class KillCommand extends Command {
  constructor () {
    super('kill', {
      aliases: ['kills', 'kill'],
      description: 'Kills some users.',
      options: {
        credits: 'Santa illu™#8235 <286011141619187712>',
        usage: 'kill <@mention-1> [@mention-2] [...] [@mention-n]'
      }
    })
  }

  async exec (message) {
    if (!message.mentions.users.size) {
      return message.status.error('@mention some people to kill.')
    }

    const content = message.mentions.users
      .map(m => Kills[Math.round(Math.random() * Kills.length)].replace(/@/g, m))
      .join('\n')

    await message.edit(content)
  }
}

module.exports = KillCommand
