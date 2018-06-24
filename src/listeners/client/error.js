const { Listener } = require('discord-akairo')
const Logger = require('./../../util/Logger')

class ErrorListener extends Listener {
  constructor () {
    super('error', {
      emitter: 'client',
      event: 'error'
    })
  }

  async exec (error) {
    Logger.stacktrace(error)
  }
}

module.exports = ErrorListener
