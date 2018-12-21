const { Listener } = require('discord-akairo')
const Logger = require('./../../util/Logger')

class CommandStartedListener extends Listener {
  constructor () {
    super('commandStarted', {
      emitter: 'commandHandler',
      event: 'commandStarted'
    })
  }

  async exec (message, command, args) {
    Logger.log(`=> ${command.id}`, { tag: this.tag(message) })
    this.client.stats.increment('commands-started')
  }

  tag (message) {
    if (message.guild) return message.guild.name
    if (message.channel.recipient) return `${message.channel.recipient.tag}/DM`
    if (message.channel.owner) return `${message.channel.name || message.channel.owner.tag}/Group`
    return `${message.channel.id}/Unknown`
  }
}

module.exports = CommandStartedListener
