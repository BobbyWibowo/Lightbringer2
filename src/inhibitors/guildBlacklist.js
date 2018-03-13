const { Inhibitor } = require('discord-akairo')

class GuildBlacklistInhibitor extends Inhibitor {
  constructor () {
    super('guildBlacklist', {
      reason: 'GUILD_BLACKLISTED',
      type: 'all'
    })

    this.storage = null

    this.guilds = []

    this.homeGuild = null
  }

  exec (message) {
    if (message.guild && this.guilds.includes(message.guild.id) && this.homeGuild !== message.guild.id) {
      // Returns true to block messages from the said guild
      return true
    } else {
      return false
    }
  }

  callback () {
    // This should be called whenever the list is being updated
    this.guilds = this.storage.get('guilds') || []
  }

  onReady () {
    const homeGuild = this.client.configManager.get('homeGuild')

    if (homeGuild) {
      this.homeGuild = homeGuild
    }

    this.storage = this.client.storage('guild-blacklist')
    this.callback()
  }
}

module.exports = GuildBlacklistInhibitor
