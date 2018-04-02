const { CommandHandler } = require('discord-akairo')

class LCommandHandler extends CommandHandler {
  constructor (client, options = {}) {
    super(client, options)

    const {
      statusTimeout = -1
    } = client.akairoOptions

    this.statusTimeout = statusTimeout

    this.statusTemplates = {
      success: {
        icon: '✅',
        timeout: this.statusTimeout
      },
      error: {
        icon: '⛔',
        timeout: this.statusTimeout
      },
      question: {
        icon: '❓',
        timeout: this.statusTimeout
      },
      progress: {
        icon: '🔄',
        timeout: -1
      }
    }
  }

  async _status (status, message, timeout) {
    if (!status) { return false }

    const statusTemplates = this.client.commandHandler.statusTemplates
    const template = statusTemplates[status] || statusTemplates[Object.keys(statusTemplates)[status]]
    if (!template) {
      throw new Error(`Template with id: ${status} is not available.`)
    }

    await this.edit(`${template.icon}${message ? `\u2000${message}` : ''}`)

    if (timeout === undefined || timeout === null) {
      timeout = template.timeout >= 0 ? template.timeout : -1
    }

    if (timeout >= 0) {
      return this.delete({ timeout })
    }
  }

  async handle (message) {
    if (message.author.id === this.client.user.id) {
      this.client.stats.increment('messages-sent')

      if (!message.status) {
        message.status = this._status
      }
    } else {
      this.client.stats.increment('messages-received')
    }

    return super.handle(message)
  }

  load (thing, isReload) {
    const mod = super.load(thing, isReload)

    if (this.client.stats.get('initiated') && isReload && mod && typeof mod.onReady === 'function') {
      mod.onReady()
    }

    return mod
  }

  reload (id) {
    const mod = this.modules.get(id.toString())

    if (mod && typeof mod.onReload === 'function') {
      mod.onReload()
    }

    return super.reload(id)
  }

  remove (id) {
    const mod = this.modules.get(id.toString())

    if (mod && typeof mod.onRemove === 'function') {
      mod.onRemove()
    }

    return super.remove(id)
  }
}

module.exports = LCommandHandler
