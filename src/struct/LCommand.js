const { Command } = require('discord-akairo')

class LCommand extends Command {
  constructor (id, options = {}) {
    if (!Array.isArray(options.args))
      options.args = []

    options.args.unshift({
      id: 'help',
      match: 'flag',
      flag: ['--help', '-h'],
      description: 'Shows help information of this command.'
    })

    super(id, options)

    const {
      credits = null,
      examples = [],
      hidden = false,
      usage = null,
      selfdestruct = null // in seconds
    } = options

    this.credits = credits
    this.examples = examples
    this.hidden = hidden
    this.usage = usage
    this.selfdestruct = selfdestruct
  }

  exec (...args) {
    if (typeof args[1] === 'object' && args[1].help) {
      const helpCommand = this.handler.modules.get('help')
      if (!helpCommand)
        return args[0].status('error', 'Help module is missing!')
      return helpCommand.run(args[0], { command: this })
    }
    return this.run(...args)
  }

  sd (short) {
    if (!this.selfdestruct) return ''
    const unit = `second${this.selfdestruct === 1 ? '' : 's'}`
    if (short) return `Self-destruct in ${this.selfdestruct}s`
    return `*This message will self-destruct in ${this.selfdestruct} ${unit}.*`
  }
}

module.exports = LCommand
