const { Command } = require('discord-akairo')
const mathjs = require('mathjs')

class MathCommand extends Command {
  constructor () {
    super('math', {
      aliases: ['math', 'calculate', 'calc', 'solve'],
      description: 'Calculate math expression with mathjs. Global scope (variables) will be saved to the storage file, but it will only be able to save regular values (numbers). Functions will be lost after a bot restart.',
      args: [
        {
          id: 'expressions',
          match: 'rest',
          description: 'Separate each expression with a new line. Be very careful when using minus operator (-). If they can be parsed as any of the command\'s flag, they will be removed from the expression.'
        },
        {
          id: 'localScope',
          match: 'flag',
          prefix: ['--localScope', '--local', '-l'],
          description: 'Turns on local scope. When this is enabled, previously saved variables will not be accessible from the expression (when this is not enabled, all variables will be stored in a global scope).'
        },
        {
          id: 'clearScope',
          match: 'flag',
          prefix: ['--clearScope', '--clear', '-c'],
          description: 'Clear all saved variables from the global scope. This can be used while running the command with math expressions, in which case it will clear the scope BEFORE evaluating the math expressions.'
        },
        {
          id: 'singleResult',
          match: 'flag',
          prefix: ['--singleResult', '--single', '-s'],
          description: 'Shows only the final result of the expression.'
        },
        {
          id: 'hideLineNumbers',
          match: 'flag',
          prefix: ['--hideLineNumbers', '--hide', '--hln', '-h'],
          description: 'Hides line numbers. It will not show line numbers if there is only one expression.'
        },
        {
          id: 'printScope',
          match: 'flag',
          prefix: ['--printScope', '--print', '-p'],
          description: 'Prints scope.'
        },
        {
          id: 'documentation',
          match: 'flag',
          prefix: ['--documentation', '--docs', '-d', '--reference', '--ref', '-r'],
          description: 'Displays link to mathjs online documentation.'
        }
      ],
      options: {
        usage: 'math < --clearScope [expressions] | --localScope [--clearScope] <expressions> | expressions >'
      }
    })

    this.storage = null
  }

  async exec (message, args) {
    if (args.documentation) {
      return message.status.success('Math.js documentation: http://mathjs.org/docs/.', -1)
    }

    if (args.printScope) {
      return message.edit(`⚙\u2000Global scope of \`${this.id}\` command:\n${this.client.util.formatCode(require('util').inspect(this.scope), 'js')}`)
    }

    if (args.clearScope && !args.expressions) {
      this.scope = {}
      this.storage.set('scope', this.scope)
      this.storage.save()
      return message.status.success('Cleared global scope.')
    }

    if (!args.expressions) {
      return message.status.error(`Usage: \`${this.options.usage}\`.`)
    }

    let scope = args.localScope ? {} : this.scope

    const expressions = args.expressions.split('\n')
    const results = []

    let errored = false
    for (let i = 0; i < expressions.length; i++) {
      const parsed = mathjs.parse(expressions[i], scope)
      expressions[i] = parsed.toString()

      if (errored !== false) {
        results.push(null)
        continue
      }

      try {
        let result = parsed.eval(scope)
        results.push(result)
      } catch (err) {
        results.push(err.toString())
        errored = i
      }
    }

    // Save scope to storage.
    this.storage.set('scope', this.scope)
    this.storage.save()

    const eln = !args.hideLineNumbers && expressions.length > 1
    const strExpressions = expressions.map((v, i) => `${eln ? `${i} :: ` : ''}${v}`).join('\n')

    let rln, strResults
    if (args.singleResult) {
      rln = false
      strResults = errored ? results[errored] : results[results.length - 1]
    } else {
      rln = !args.hideLineNumbers && results.length > 1
      strResults = results.map((v, i) => `${rln ? `${i} :: ` : ''}${v === null ? '\u2026' : v}`).join('\n')
    }

    const strs = `•  **Math expression${expressions.length > 1 ? 's' : ''}:**\n` +
      this.client.util.formatCode(strExpressions, eln ? 'asciidoc' : 'js') + '\n' +
      `•  **Result${results.length > 1 ? 's' : ''}:**\n` +
      this.client.util.formatCode(strResults, rln ? 'asciidoc' : 'js') + '\n'

    return message.edit(strs)
  }

  onReady () {
    this.storage = this.client.storage('math')
    this.scope = this.storage.get('scope') || {}
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = MathCommand
