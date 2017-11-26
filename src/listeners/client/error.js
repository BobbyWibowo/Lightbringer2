const { Listener } = require('discord-akairo')

class ErrorListener extends Listener {
  constructor () {
    super('error', {
      emitter: 'client',
      event: 'error'
    })
  }

  async exec (error) {
    console.error(error.stack || error)
  }
}

module.exports = ErrorListener
