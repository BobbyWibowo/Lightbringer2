const { Inhibitor } = require('discord-akairo')

class BlacklistInhibitor extends Inhibitor {
  constructor () {
    super('blacklist', {
      reason: 'blacklist',
      type: 'pre',
      priority: 10
    })

    this.storage = null

    // We are caching these values into local variables for performance reasons
    this.guilds = []
    this.homeGuild = null
  }

  exec (message) {
    // Return true to block message from the said guild
    return message.guild &&
      this.guilds.includes(message.guild.id) &&
      this.homeGuild !== message.guild.id
  }

  update () {
    // This should be called whenever the list is being updated
    this.guilds = this.storage.get('guilds') || []
  }

  onReady () {
    const homeGuild = this.client.configManager.get('homeGuild')

    if (homeGuild)
      this.homeGuild = homeGuild

    this.storage = this.client.storage('guild-blacklist')
    this.update()
  }
}

module.exports = BlacklistInhibitor
