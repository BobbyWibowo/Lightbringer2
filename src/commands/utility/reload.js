const LCommand = require('./../../struct/LCommand')

const TYPE_STRINGS = ['Command', 'Inhibitor', 'Listener']

class ReloadCommand extends LCommand {
  constructor () {
    super('reload', {
      aliases: ['reload', 'r'],
      description: 'Reloads modules.',
      args: [
        {
          id: 'all',
          match: 'flag',
          flag: ['--all', '-a'],
          description: 'Reloads all modules (commands, inhibitors and listeners).'
        },
        {
          id: 'type',
          match: 'option',
          flag: ['--type=', '-t='],
          description: 'Type of the modules. With "all" flag, only modules of the specified type will be reloaded.',
          type: (word, message, args) => {
            args._type = Boolean(word.length)
            if (/^c(ommand(s)?)?$/i.test(word)) { return 0 }
            if (/^i(nhibitor(s)?)?$/i.test(word)) { return 1 }
            if (/^l(istener(s)?)?$/i.test(word)) { return 2 }
          }
        },
        {
          id: 'modules',
          match: 'rest',
          allow: (message, args) => !args.all,
          type: (word, message, args) => {
            args._modules = Boolean(word.length)
            args._nomatches = []
            const matches = []
            const keywords = word.split(' ')
            let handler = this.handler
            if (args.type === 1) {
              handler = this.client.inhibitorHandler
            } else if (args.type === 2) {
              handler = this.client.listenerHandler
            }
            for (const keyword of keywords) {
              let match
              if (handler === this.handler) {
                match = handler.findCommand(keyword)
              } else {
                match = handler.modules.get(keyword)
              }
              if (match) {
                matches.push(match)
              } else {
                args._nomatches.push(`\`${keyword}\``)
              }
            }
            return matches
          },
          description: 'IDs of the modules. Defaults to command modules when "type" flag is not specified. For command modules, their aliases can also be used.'
        }
      ],
      usage: 'reload < --all [--type=] | [--type=] module-1 [module-2] [...] [module-n] >'
    })
  }

  async exec (message, args) {
    const typeString = TYPE_STRINGS[args.type || 0].toLowerCase()
    if (args.modules && args.modules.length) {
      const success = []
      const failure = []
      const x = args._nomatches || []
      for (const mod of args.modules) {
        if (mod.reload()) {
          success.push(`\`${mod.id}\``)
        } else {
          failure.push(`\`${mod.id}\``)
        }
      }
      const string = []
      if (success.length) {
        string.push(`🆗\u2000Reloaded ${typeString}${success.length === 1 ? '' : 's'}: ${success.join(', ')}.`)
      }
      if (failure.length) {
        string.push(`⛔\u2000Could not reload ${typeString}${failure.length === 1 ? '' : 's'}: ${failure.join(', ')}.`)
      }
      if (x.length) {
        string.push(`❓\u2000Could not find matching ${typeString}${x.length === 1 ? '' : 's'}: ${x.join(', ')}.`)
      }
      return message
        .edit(string.join('\n\n'))
        .then(m => m.delete({ timeout: this.handler.statusTimeout }))
    } else if (args.all) {
      if (args.type === 0 || args.type === null) { this.handler.reloadAll() }
      if (args.type === 1 || args.type === null) { this.client.inhibitorHandler.reloadAll() }
      if (args.type === 2 || args.type === null) { this.client.listenerHandler.reloadAll() }
      if (args.type === null) {
        return message.status('success', 'Reloaded all commands, inhibitors and listeners.')
      } else {
        return message.status('success', `Reloaded all ${typeString}s.`)
      }
    } else if (args._type && args.type === null) {
      return message.status('error', 'That type is unavailable! Try either `commands`, `inhibitors` or `listeners`.')
    } else if (args._modules) {
      return message.status('error', 'Could not find any module with those IDs.')
    } else {
      return message.status('error', 'You must specify IDs of the modules that you want to reload.')
    }
  }
}

module.exports = ReloadCommand
