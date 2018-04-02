const { Listener } = require('discord-akairo')

class MissingPermissionsListener extends Listener {
  constructor () {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions'
    })
  }

  async exec (message, command, type, missing) {
    return message.status('error',
      `Could not execute \`${command}\` command due to missing permissions: ` +
      missing.map(m => `\`${m}\``).join(', ') + '.',
      15000
    )
  }
}

module.exports = MissingPermissionsListener
