const { Argument, Command } = require('discord-akairo')

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
    // It may not be pretty, but it gets the jobs done.
    // It should also not be too hard to understand what
    // it does by merely reading the codes.
    if (args.all) { // When using "--all" flag to list all commands.
      // Use length of the longest command's ID as padding.
      const padding = ' '.repeat(this.handler.modules.reduce((a, v, k) => (a > k.length) ? a : k.length, 0))

      let formatted = ''

      this.handler.categories
        .map(category => {
          const modules = this.handler.modules.filter(m => m.category.id === category.id)
          return { category, modules }
        })
        .forEach(item => {
          const id = item.category.id

          formatted += id + '\n'
          formatted += '~'.repeat(id.length) + '\n'

          item.modules.forEach(m => {
            formatted += this.client.util.pad(padding, m.id)
            formatted += ' :: '
            formatted += (m.description || '<no description>') + '\n'
          })

          formatted += '\n'
        })

      if (this.git) {
        await message.edit(this.git)
      }

      return this.client.util.multiSend(message.channel, formatted.trim(), {
        firstMessage: !this.git ? message : null,
        code: 'asciidoc'
      })
    } else if (args.command) { // When displaying help for a specific command.
      const id = args.command.id

      let formatted = ''

      formatted += id + '\n'
      formatted += '~'.repeat(id.length) + '\n'
      formatted += `Aliases     :: ${args.command.aliases.join(', ')}` + '\n'
      formatted += `Description :: ${args.command.description}` + '\n'

      if (args.command.options.credits) {
        formatted += `Credits     :: ${args.command.options.credits}` + '\n'
      }

      formatted += `Usage       :: ${args.command.options.usage || 'N/A'}` + '\n'

      // For now, it will only list detailed explanation of
      // the arguments if the command's args property is an
      // array and the arguments are all instances of Argument.
      if (args.command.args instanceof Array) {
        const _args = args.command.args
          .filter(a => a instanceof Argument)
          .map(a => {
            let tag = a.id
            let prefix = a.prefix
            if (prefix) {
              if (typeof prefix === 'string') {
                prefix = [prefix]
              }
              tag = prefix.join(', ')
            }
            return {
              tag,
              description: a.description
            }
          })

        if (_args.length) {
          // Use length of the longest argument's "tag" as padding.
          // 11 chars is the minimum length to match the length of Aliases,
          // Description, Credits, and so on (look above).
          const padding = ' '.repeat(_args.reduce((a, v) => (a > v.tag.length) ? a : v.tag.length, 11))

          formatted += '\n'
          formatted += 'Arguments' + '\n'
          formatted += '~~~~~~~~~' + '\n'

          _args.forEach(a => {
            formatted += this.client.util.pad(padding, a.tag)
            formatted += ' :: '
            formatted += (a.description || '<no description>') + '\n'
          })
        }
      }

      if (args.command.options.examples instanceof Array) {
        const _examples = args.command.options.examples
          .map(e => {
            if (typeof e === 'string') return { content: e }
            return e
          })

        // Use length of the longest example as padding.
        // 11 chars is the minimum length to match the length of Aliases,
        // Description, Credits, and so on (look above).
        const padding = ' '.repeat(_examples.reduce((a, v) => (a > v.content.length) ? a : v.content.length, 11))

        formatted += '\n'
        formatted += 'Examples' + '\n'
        formatted += '~~~~~~~~' + '\n'

        _examples.forEach(e => {
          formatted += this.client.util.pad(padding, e.content)
          formatted += ' :: '
          formatted += (e.description || '<no description>') + '\n'
        })
      }

      return this.client.util.multiSend(message.channel, formatted.trim(), {
        firstMessage: message,
        code: 'asciidoc'
      })
    } else if (args._command) { // When keyword was specified but no matching commands could be found.
      return message.status.error('Could not find a module with that ID!')
    } else { // When run without arguments.
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
