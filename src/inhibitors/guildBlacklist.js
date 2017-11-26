const { Inhibitor } = require('discord-akairo')

class GuildBlacklistInhibitor extends Inhibitor {
  constructor () {
    super('blacklist', {
      reason: 'blacklist'
    })
  }

  exec (message) {
    const blacklist = ['383523876987994114']

    // Returns true to block messages from the said guild
    return message.guild ? blacklist.includes(message.guild.id) : false
  }
}

module.exports = GuildBlacklistInhibitor
