const { Command } = require('discord-akairo')

class LCommand extends Command {
  constructor (id, options = {}) {
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
    this._selfdestruct = selfdestruct
  }

  selfdestruct (short) {
    if (!this._selfdestruct) { return null }
    const unit = `second${this._selfdestruct === 1 ? '' : 's'}`
    if (short) { return `Self-destruct in ${this._selfdestruct}s` }
    return `*This message will self-destruct in ${this._selfdestruct} ${unit}.*`
  }
}

module.exports = LCommand
