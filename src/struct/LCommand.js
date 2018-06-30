const { Command } = require('discord-akairo')

class LCommand extends Command {
  constructor (id, options = {}) {
    super(id, options)

    const {
      credits = null,
      examples = {},
      hidden = false,
      usage = null
    } = options

    this.credits = credits
    this.examples = examples
    this.hidden = hidden
    this.usage = usage
  }
}

module.exports = LCommand
