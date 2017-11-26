const { Listener } = require('discord-akairo')

class UnhandledRejectionListener extends Listener {
  constructor () {
    super('unhandledRejection', {
      emitter: 'process',
      event: 'unhandledRejection'
    })
  }

  async exec (error) {
    console.error(error)
  }
}

module.exports = UnhandledRejectionListener
