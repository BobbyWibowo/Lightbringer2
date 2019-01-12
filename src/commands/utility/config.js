const LCommand = require('./../../struct/LCommand')

class ConfigCommand extends LCommand {
  constructor () {
    super('config', {
      aliases: ['config'],
      description: 'Modify the configuration file (will have to restart bot in order for changes to take effect).',
      args: [
        {
          id: 'list',
          match: 'flag',
          flag: ['--list', '-l'],
          description: 'Lists available configuration keys.'
        },
        {
          id: 'key',
          description: 'The key in the configuration file.'
        },
        {
          id: 'value',
          match: 'rest',
          description: 'The value that you would like to set for the specified key.'
        }
      ],
      usage: 'config < --list | key [value] >'
    })
  }

  async run (message, args) {
    if (args.list) {
      const configKeys = this.client.configManager.getKeys()
      const objectKeys = Object.keys(configKeys)
      const padding = ' '.repeat(objectKeys.reduce((a, v) => (a > v.length) ? a : v.length, 0))
      const formatted = objectKeys
        .map(key => {
          const left = this.client.util.pad(padding, key) + ' :: '
          const right = Object.keys(configKeys[key])
            .map(_key => {
              let _value = configKeys[key][_key]
              if (Array.isArray(_value)) _value = _value.join(', ')
              return `${_key}: ${_value}`
            })
            .join('; ')
          return left + (right || '<no settings>')
        })
        .join('\n')
      return message.edit('⚙\u2000Configuration keys:\n' + this.client.util.formatCode(formatted, 'asciidoc'))
    }

    if (!args.key)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    if (!args.value) {
      let value
      try {
        value = this.client.configManager.get(args.key)
      } catch (error) {
        return message.status('error', error.toString())
      }

      const token = this.client.token.split('').join('[^]{0,2}')
      const rev = this.client.token.split('').reverse().join('[^]{0,2}')
      const tokenRegex = new RegExp(`${token}|${rev}`, 'g')

      value = `${value}`.replace(tokenRegex, '[TOKEN]')

      return message.edit(`⚙\u2000Configuration: \`${args.key}\` = \`${value}\`.`)
    }

    try {
      this.client.configManager.set(args.key, args.value)
    } catch (error) {
      return message.status('error', error.toString())
    }
    return message.status('success', 'Successfully saved new value. Restart the bot in order for changes to take effect.')
  }
}

module.exports = ConfigCommand
