const { Listener } = require('discord-akairo')

class MessageBlockedListener extends Listener {
  constructor () {
    super('messageBlocked', {
      emitter: 'commandHandler',
      event: 'messageBlocked'
    })
  }

  async exec (message, reason) {
    if (reason === 'others') {
      message.channel.messages.delete(message.id)
    }
  }
}

module.exports = MessageBlockedListener
