const { Kills } = require('../../util/Constants')
const LCommand = require('./../../struct/LCommand')

class KillCommand extends LCommand {
  constructor () {
    super('kill', {
      aliases: ['kills', 'kill'],
      description: 'Kills some users.',
      usage: 'kill @mention-1 [@mention-2] [...] [@mention-n]',
      credits: 'illu <286011141619187712>'
    })
  }

  async exec (message) {
    if (!message.mentions.users.size)
      return message.status('error', '@mention some people to kill.')

    const content = message.mentions.users
      .map(m => Kills[Math.round(Math.random() * Kills.length)].replace(/@/g, m))
      .join('\n')

    await message.edit(content)
  }
}

module.exports = KillCommand
