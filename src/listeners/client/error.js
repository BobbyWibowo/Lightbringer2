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
    const whitelistedErrors = ['ErrorEvent']
    if (error.constructor &&
      error.constructor.name &&
      whitelistedErrors.includes(error.constructor.name))
      error = error.toString()
    Logger.error(error, { tag: this.id })
  }
}

module.exports = ErrorListener
