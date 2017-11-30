const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util
const { inspect } = require('util')

class EvalCommand extends Command {
  constructor () {
    super('eval', {
      aliases: ['evaluate', 'eval'],
      description: 'Evaluates arbritrary JavaScript codes.',
      args: [
        {
          id: 'content',
          match: 'content',
          description: 'The JavaScript codes that you want to be evaluated.'
        }
      ]
    })
  }

  async exec (message, args) {
    let result, type, isError
    const time = process.hrtime()
    try {
      result = await eval(args.content) // eslint-disable-line no-eval
    } catch (error) {
      result = error.toString()
      isError = true
    }
    const diff = process.hrtime(time)

    if (!isError) {
      type = result !== undefined && result.constructor ? result.constructor.name : 'undefined'
      result = escapeMarkdown(inspect(result, { depth: 0 }), true)
    }

    let tempString = '•  **JavaScript codes:**\n' +
      this.client.util.formatCode(escapeMarkdown(args.content, true), 'js') + '\n' +
      `•  ${isError ? '**Evaluation error:**' : '**Result:**'}\n` +
      '%s\n' +
      `•  ${type ? `Type: ${type} | ` : ''}Execution time: ${this.client.util.formatTimeNs(diff[0] * 1e9 + diff[1])}`

    // 2 characters for %s and 10 characters for js code block
    const maxResultLength = 2000 - tempString.length - 2 - 10
    if (result.length > maxResultLength) {
      const errorMessage = `Output was too long to be displayed in a message (${maxResultLength - result.length}).`
      tempString = tempString.replace('%s', this.client.util.formatCode(errorMessage))
    } else {
      tempString = tempString.replace('%s', this.client.util.formatCode(result, 'js'))
    }

    await message.edit(tempString)
  }
}

module.exports = EvalCommand
