const { Inhibitor } = require('discord-akairo')

class OthersInhibitor extends Inhibitor {
  constructor () {
    super('others', {
      reason: 'others',
      type: 'pre'
    })
  }

  exec (message) {
    // This inhibits messages not posted by bot itself (for selfbots)
    return message.author.id !== this.client.user.id
  }
}

module.exports = OthersInhibitor
