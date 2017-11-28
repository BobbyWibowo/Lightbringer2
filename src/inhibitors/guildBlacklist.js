const { Inhibitor } = require('discord-akairo')

class GuildBlacklistInhibitor extends Inhibitor {
  constructor () {
    super('guildBlacklist', {})
  }

  exec (message) {
    // TOOD: Get list from storage
    const blacklist = ['160966337122926592']

    // Returns true to block messages from the said guild
    return message.guild ? blacklist.includes(message.guild.id) : false
  }
}

module.exports = GuildBlacklistInhibitor
