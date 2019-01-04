const { Listener } = require('discord-akairo')
const Logger = require('./../../util/Logger')

class CommandFinishedListener extends Listener {
  constructor () {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished'
    })
  }

  async exec (message, command, args, returnValue) {
    if (!command._selfdestruct) return

    const msgs = []
    if (Array.isArray(returnValue)) {
      await Promise.all(returnValue.map(msg => {
        msgs.push(msg.id)
        return msg.delete({ timeout: command._selfdestruct * 1000 }).catch(() => {})
      }))
    } else {
      msgs.push(message.id)
      await message.delete({ timeout: command._selfdestruct * 1000 }).catch(() => {})
    }

    Logger.log(`Self-destruct ${msgs.join(', ')} (${command._selfdestruct}s).`, { tag: command.id })
  }
}

module.exports = CommandFinishedListener
