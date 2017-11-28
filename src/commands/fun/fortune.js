const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch')

const CATEGORIES = {
  all: /^a(ll)?$/,
  computers: /^comp(uter(s)?)?$/i,
  cookie: /^c(ookie)?$/i,
  definitions: /^d(ef(inition(s)?)?)?$/i,
  people: /^p(eople)?$/i,
  platitudes: /^pla(t(itude(s)?)?)?$/i,
  science: /^s(cience)?$/i,
  wisdom: /^w(isdom)?$/i
}

class FortuneCommand extends Command {
  constructor () {
    super('fortune', {
      aliases: ['fortunecookie', 'fortune'],
      description: 'Shows a random fortune cookie.',
      args: [
        {
          id: 'type',
          match: 'rest',
          type: (word, message, args) => {
            for (const key of Object.keys(CATEGORIES)) {
              if (CATEGORIES[key].test(word)) {
                return key
              }
            }
            if (!word.length) {
              return ''
            }
          }
        },
        {
          id: 'list',
          match: 'flag',
          prefix: ['--list', '-l']
        }
      ]
    })
  }

  async exec (message, args) {
    if (args.type === null) {
      return message.status.error('That type is not available! Use `--list` flag to list all available types!')
    }

    if (args.list) {
      return message.edit(`🔮\u2000|\u2000**Available types for \`fortune\` command:** ${Object.keys(CATEGORIES).join(', ')}.`)
    }

    await message.edit('🔄\u2000Getting a fortune cookie\u2026')
    const result = await snekfetch.get(`http://yerkee.com/api/fortune/${args.type}`)

    if (result.status !== 200) {
      return message.status.error('Could not retrieve fortune!')
    }

    await message.edit(`🔮\u2000|\u2000**Fortune cookie${args.type.length ? ` (${args.type})` : ''}:**\n\n${result.body.fortune}`)
  }
}

module.exports = FortuneCommand
