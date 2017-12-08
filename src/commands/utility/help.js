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
        usage: 'help < --all | command >'
      }
    })

    this.git = null
  }

  async exec (message, args) {
    if (args.all) {
      // Use length of the longest command's ID as padding
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
          formatted += '='.repeat(id.length) + '\n'

          item.modules.forEach(m => {
            formatted += this.client.util.pad(padding, m.id)
            formatted += ' :: '
            formatted += (m.description || '<no description>') + '\n'
          })

          formatted += '\n'
        })

      if (this.git) {
        await message.channel.send(this.git)
      }

      await this.client.util.multiSend(message.channel, formatted.trim(), {
        code: 'asciidoc'
      })

      return message.delete()
    } else if (args.command) {
      const id = args.command.id

      let formatted = ''

      formatted += id + '\n'
      formatted += '='.repeat(id.length) + '\n'
      formatted += `Aliases     :: ${args.command.aliases.join(', ')}` + '\n'
      formatted += `Description :: ${args.command.description}` + '\n'

      if (args.command.options.credits) {
        formatted += `Credits     :: ${args.command.options.credits}` + '\n'
      }

      formatted += `Usage       :: ${args.command.options.usage || 'N/A'}` + '\n'

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
          // Use length of the longest argument's "tag" as padding (11 is the minimum length)
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

      await this.client.util.multiSend(message.channel, formatted.trim(), {
        code: 'asciidoc'
      })

      return message.delete()
    } else if (args._command) {
      return message.status.error('Could not find a module with that ID!')
    } else {
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
