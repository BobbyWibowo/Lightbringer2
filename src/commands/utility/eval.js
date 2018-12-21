const { escapeMarkdown } = require('discord.js').Util
const { inspect } = require('util')
const LCommand = require('./../../struct/LCommand')
const Logger = require('./../../util/Logger')

function _eval (message, args) {
  // eslint-disable-next-line no-eval
  return eval(args.codes)
}

class EvalCommand extends LCommand {
  constructor () {
    super('eval', {
      aliases: ['evaluate', 'eval'],
      description: 'Evaluates arbritrary JavaScript codes.',
      args: [
        {
          id: 'silent',
          match: 'flag',
          flag: ['--silent', '-s'],
          description: 'Silent mode.'
        },
        {
          id: 'codes',
          match: 'rest',
          description: 'Arbritrary JavaScript codes that you want to be evaluated.'
        }
      ],
      usage: 'evaluate [--silent] <codes>',
      selfdestruct: 60
    })
  }

  async exec (message, args) {
    if (!args.codes)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    const time = process.hrtime()
    let result, isError, type
    try {
      result = await _eval.call(this, message, args)
    } catch (error) {
      result = error
      isError = true
    }
    const diff = process.hrtime(time)

    if (args.silent)
      return Logger.log(inspect(result, { depth: 1 }), { tag: `${this.id}/silent` })

    if (!isError) {
      if (result && result.constructor) type = result.constructor.name
      result = inspect(result, { depth: 0 })
    }

    const token = this.client.token.split('').join('[^]{0,2}')
    const rev = this.client.token.split('').reverse().join('[^]{0,2}')
    const tokenRegex = new RegExp(`${token}|${rev}`, 'g')

    result = result.replace(tokenRegex, '[TOKEN]')

    const string =
      '**JavaScript:**\n' +
      `${this.client.util.formatCode(escapeMarkdown(args.codes, true), 'js')}` +
      `${isError ? '**Error:**' : '**Result:**'}\n` +
      `${this.client.util.formatCode(escapeMarkdown(result, true), 'js')}` +
      `${type ? `Type: ${type} | ` : ''}Time taken: \`${this.client.util.formatHrTime(diff)}\` | ${this.selfdestruct(true)}`

    if (string.length > 2000)
      return message.status('error', `Output is too long (+${string.length - 2000}).`)

    return message.edit(string)
  }
}

module.exports = EvalCommand
