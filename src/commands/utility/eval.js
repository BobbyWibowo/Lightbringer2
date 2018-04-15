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
          id: 'silent',
          match: 'flag',
          prefix: ['--silent', '-s'],
          description: 'Silent mode.'
        },
        {
          id: 'content',
          match: 'rest',
          description: 'Arbritrary JavaScript codes that you want to be evaluated.'
        }
      ],
      options: {
        usage: 'evaluate [--silent] <content>'
      }
    })
  }

  async exec (message, args) {
    if (!args.content) {
      return message.status('error', `Usage: \`${this.options.usage}\`.`)
    }

    const time = process.hrtime()
    let result, isError, type
    try {
      // eslint-disable-next-line no-eval
      result = await eval(args.content)
    } catch (error) {
      result = error
      isError = true
    }
    const diff = process.hrtime(time)

    if (args.silent) {
      return console.log(inspect(result, { depth: 1 }))
    }

    if (!isError) {
      if (result && result.constructor) { type = result.constructor.name }
      result = inspect(result, { depth: 0 })
    }

    const token = this.client.token.split('').join('[^]{0,2}')
    const rev = this.client.token.split('').reverse().join('[^]{0,2}')
    const tokenRegex = new RegExp(`${token}|${rev}`, 'g')

    result = result.replace(tokenRegex, '[TOKEN]')

    const string =
      '•  **JavaScript codes:**\n' +
      `${this.client.util.formatCode(escapeMarkdown(args.content, true), 'js')}\n` +
      `${isError ? '**Evaluation error:**' : '**Result:**'}\n` +
      `${this.client.util.formatCode(escapeMarkdown(result, true), 'js')}\n` +
      `•  ${type ? `Type: ${type} | ` : ''}Time taken: \`${this.client.util.formatTimeNs(diff[0] * 1e9 + diff[1])}\``

    if (string.length > 2000) {
      return message.status('error', `Output is too long (+${string.length - 2000}).`)
    }

    return message.edit(string)
  }
}

module.exports = EvalCommand
