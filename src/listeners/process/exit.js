const { Listener } = require('discord-akairo')

class ExitListener extends Listener {
  constructor () {
    super('exit', {
      emitter: 'process',
      event: 'exit'
    })
  }

  async exec () {
    this.client.storage.saveAll()
  }
}

module.exports = ExitListener
