const { Argument, Command } = require('discord-akairo')
const { stripIndent, stripIndents } = require('common-tags')

class HelpCommand extends Command {
  constructor () {
    super('help', {
      aliases: ['help', 'h'],
      description: 'Shows you help of all commands or a particular command.',
      args: [
        {
          id: 'all',
          match: 'flag',
          prefix: ['--all', '-a'],
          description: 'Lists all commands and their description.'
        },
        {
          id: 'command',
          match: 'text',
          type: (word, message, args) => {
            args._command = Boolean(word.length)
            return this.handler.findCommand(word)
          },
          description: 'The command that you would want to show the help of.'
        }
      ],
      options: {
        usage: 'help < --all | command >',
        examples: [
          'help --all',
          {
            content: 'help reload',
            description: 'Shows help of a command named "reload".'
          }
        ]
      }
    })

    this.git = null
  }

  async exec (message, args) {
    if (args.all) {
      // Use length of the longest command's ID as padding.
      const padding = ' '.repeat(this.handler.modules.reduce((a, v, k) => (a > k.length) ? a : k.length, 0))

      const formatted = this.handler.categories
        .map(category => {
          const id = category.id
          const modules = this.handler.modules.filter(m => m.category.id === id && (m.options && !m.options.hidden))

          if (!modules.size) {
            return false
          }

          const lines = modules.map(m => {
            return `${this.client.util.pad(padding, m.id)} :: ${m.description || '<no description>'}`
          })

          return stripIndents`
            ${id}
            ${'='.repeat(id.length)}
            ${lines.join('\n')}
          `
        })
        .filter(f => f)
        .join('\n\n')

      if (this.git) {
        await message.edit(this.git)
      }

      return this.client.util.multiSend(message.channel, formatted, {
        firstMessage: !this.git ? message : null,
        code: 'asciidoc'
      })
    } else if (args.command) {
      const id = args.command.id

      let formatted = stripIndent`
        Help for "${id}" command:
        ${'='.repeat(20 + id.length)}
        Aliases     :: ${args.command.aliases.join(', ')}
        Description :: ${args.command.description || 'N/A'}
      `

      if (args.command.options.credits) {
        formatted += '\n' + `Credits     :: ${args.command.options.credits || 'N/A'}`
      }

      if (args.command.options.usage) {
        formatted += '\n' + `Usage       :: ${args.command.options.usage || 'N/A'}`
      }

      const MIN_PAD = 11 // length of "Description"

      if (args.command.args instanceof Array) {
        const _args = args.command.args
          .filter(arg => arg instanceof Argument)
          .map(arg => {
            const prefix = (typeof arg.prefix === 'string') ? [arg.prefix] : arg.prefix
            return {
              prefix,
              tag: prefix ? prefix.join(', ') : arg.id,
              description: arg.description
            }
          })

        if (_args.length) {
          const padding = ' '.repeat(_args.reduce((a, v) => (a > v.tag.length) ? a : v.tag.length, MIN_PAD))
          const lines = _args
            .map(arg => {
              return `${this.client.util.pad(padding, arg.tag)} :: ${arg.description || '<no description>'}`
            })

          formatted += '\n\n'
          formatted += 'Arguments\n'
          formatted += '=========\n'
          formatted += lines.join('\n')
        }
      }

      if (args.command.options.examples instanceof Array) {
        const _expls = args.command.options.examples
          .map(e => (typeof e === 'string') ? { content: e } : e)

        if (_expls.length) {
          const padding = ' '.repeat(_expls.reduce((a, v) => (a > v.content.length) ? a : v.content.length, MIN_PAD))
          const lines = _expls
            .map(e => {
              return `${this.client.util.pad(padding, e.content)} :: ${e.description || '<no description>'}`
            })

          formatted += '\n\n'
          formatted += 'Examples\n'
          formatted += '========\n'
          formatted += lines.join('\n')
        }
      }

      return this.client.util.multiSend(message.channel, formatted, {
        firstMessage: message,
        code: 'asciidoc'
      })
    } else if (args._command) {
      // When keyword was specified but no matching commands could be found.
      return message.status.error('Could not find a module with that ID.')
    } else {
      // When run without arguments.
      return message.status.error(`Usage: \`${this.options.usage}\`.`)
    }
  }

  onReady () {
    if (this.client.package.repository) {
      this.git = 'https://github.com/' + this.client.package.repository.replace(/^github:/, '')
    }
  }
}

module.exports = HelpCommand
