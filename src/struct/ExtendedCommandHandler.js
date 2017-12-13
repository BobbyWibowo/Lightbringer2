const { Collection } = require('discord.js')
const { CommandHandler } = require('discord-akairo')
const CommandStatus = require('./CommandStatus')

class ExtendedCommandHandler extends CommandHandler {
  constructor (client) {
    super(client)

    const {
      commandStatusLifetime = 120000 // default
    } = client.akairoOptions

    this.commandStatusLifetime = commandStatusLifetime

    this.commandStatuses = new Collection()
  }

  async handle (message) {
    if (message.author.id === this.client.user.id) {
      this.client.stats.increment('messages-sent')

      if (this.commandStatuses.has(message.id)) {
        message.status = this.commandStatuses.get(message.id)
      } else {
        message.status = new CommandStatus(this.client, message)
        this.commandStatuses.set(message.id, message.status)

        if (this.commandStatusLifetime) {
          message.statusTimeout = this.client.setTimeout(() => this.clearStatus(message), this.commandStatusLifetime)
        }
      }
    } else {
      this.client.stats.increment('messages-received')
    }

    return super.handle(message)
  }

  clearStatus (message) {
    this.commandStatuses.delete(message.id)

    if (message.statusTimeout !== undefined) {
      this.client.clearTimeout(message.statusTimeout)
      delete message.statusTimeout
    }

    if (message.status !== undefined) {
      delete message.status
    }
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
}

module.exports = ExtendedCommandHandler
