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
}

module.exports = ExtendedCommandHandler
