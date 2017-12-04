const { Command } = require('discord-akairo')

class ConfigCommand extends Command {
  constructor () {
    super('config', {
      aliases: ['config'],
      description: 'Modify value for the configuration file.',
      args: [
        {
          id: 'key'
        },
        {
          id: 'value',
          match: 'rest'
        }
      ],
      options: {
        usage: 'config <key> [value]'
      }
    })
  }

  async exec (message, args) {
    if (!args.key) {
      return message.status.error(`Usage: \`${this.options.usage}\``)
    }

    if (!args.value) {
      let value
      try {
        value = this.client.configManager.get(args.key)
      } catch (error) {
        return message.status.error(error.toString())
      }
      return message.edit(`⚙\u2000Configuration: \`${args.key}\` = \`${value}\`.`)
    }

    try {
      this.client.configManager.set(args.key, args.value)
    } catch (error) {
      return message.status.error(error.toString())
    }
    return message.status.success('Successfully saved value to the configuration file. Restart the bot in order for the changes to take effect!')
  }
}

module.exports = ConfigCommand
