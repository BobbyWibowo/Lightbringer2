class GuildColors {
  constructor (client) {
    Object.defineProperties(this, {
      client: {
        value: client
      }
    })

    this.guildColors = client.storage('guild-colors')
  }

  async get (guild) {
    if (!this.guildColors) {
      throw new Error('Storage system of guild colors is not yet ready.')
    }

    if (!guild.icon) {
      return null
    }

    const saved = this.guildColors.get(guild.id)
    if (saved && saved.icon === guild.icon) {
      return saved.color
    }

    const snek = await this.client.util.snek(guild.iconURL({
      size: 128,
      format: 'png'
    }))

    if (snek.status !== 200) {
      throw new Error(snek.text)
    }

    const color = await this.client.util.getAverageColor(snek.body)
    this.guildColors.set(guild.id, {
      icon: guild.icon,
      color
    })
    this.guildColors.save()
    return color
  }
}

module.exports = GuildColors
