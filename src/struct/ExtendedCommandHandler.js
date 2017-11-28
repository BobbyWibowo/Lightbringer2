const { CommandHandler } = require('discord-akairo')
const { Collection } = require('discord.js')
const CommandStatus = require('./CommandStatus')

class ExtendedCommandHandler extends CommandHandler {
  constructor (client) {
    super(client)

    const {
      commandStatusLifetime = 0
    } = client.akairoOptions

    this.commandStatusLifetime = commandStatusLifetime
    this.commandStatuses = new Collection()
  }

  async handle (message) {
    super.handle(message)

    if (message.author.id === this.client.user.id) {
      this.client.stats.increment('messages-sent')

      if (this.commandStatuses.has(message.id)) {
        message.status = this.commandStatuses.get(message.id)
      } else {
        message.status = new CommandStatus(this.client, message)
        this.commandStatuses.set(message.id, message.status)

        if (this.commandStatusLifetime) {
          this.client.setTimeout(() => {
            this.commandStatuses.delete(message.id)
          }, this.commandStatusLifetime)
        }
      }
    } else {
      this.client.stats.increment('messages-received')
    }
  }

  reload (id) {
    const mod = this.modules.get(id.toString())

    // Attempt to tell Command that it's going to be reloaded.
    // This will be useful on Commands that have its own
    // Timeouts, so that they can be cleared first.
    if (mod && typeof mod.onReload === 'function') {
      mod.onReload()
    }

    return super.reload(id)
  }
}

module.exports = ExtendedCommandHandler
