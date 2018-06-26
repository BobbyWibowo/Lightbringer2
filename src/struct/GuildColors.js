const Logger = require('./../util/Logger')

class GuildColors {
  constructor (client, { storage }) {
    this.client = client
    this.storage = storage
    this.tag = 'GuildColors'
  }

  async get (guild) {
    if (!this.storage) {
      throw new Error('Storage system of guild colors is not yet ready.')
    }

    if (!guild.icon) {
      return null
    }

    const tag = `${this.tag}/${guild.id}`
    const saved = this.storage.get(guild.id)
    if (saved && saved.icon === guild.icon) {
      Logger.log('Icon matched, loaded color from storage.', { tag })
      return saved.color
    }

    Logger.log('Icon mismatched, fetching\u2026', { tag })
    const snek = await this.client.util.snek(guild.iconURL({
      size: 128,
      format: 'png'
    }))

    if (snek.status !== 200) {
      throw new Error(snek.text)
    }

    const color = await this.client.util.getAverageColor(snek.body)
    this.storage.set(guild.id, {
      icon: guild.icon,
      color
    })
    this.storage.save()
    Logger.log('Saved color to storage.', { tag })
    return color
  }
}

module.exports = GuildColors
