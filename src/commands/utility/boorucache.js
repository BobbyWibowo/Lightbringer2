const { Command } = require('discord-akairo')

class BooruCacheCommand extends Command {
  constructor () {
    super('boorucache', {
      aliases: ['boorucache', 'bcache', 'bc'],
      description: 'A simple utility to inspect BooruCache.',
      args: [
        {
          id: 'clear',
          match: 'flag',
          prefix: ['--clear', '-c'],
          description: 'Clear the cache.'
        }
      ],
      options: {
        usage: 'boorucache [--clear]'
      }
    })
  }

  async exec (message, args) {
    if (args.clear) {
      this.client.booruCache.clear()
      return message.status('success', 'Booru cache cleared.')
    }

    const cache = this.client.booruCache.storage
    if (!cache.keys.length) {
      return message.status('error', 'Booru cache is empty.')
    }

    const formatted = cache.keys.map(key => {
      const tag = cache.get(key)
      const sites = Object.keys(tag)
        .map(site => `  ${site}: ${tag[site].length}`)
        .join('\n')
      return (key === '' ? '<no tags>' : key) + '\n' + (sites || '  <no cache>')
    }).join('\n')

    return this.client.util.multiSend(message.channel, formatted, {
      firstMessage: message,
      code: 'js'
    })
  }
}

module.exports = BooruCacheCommand
