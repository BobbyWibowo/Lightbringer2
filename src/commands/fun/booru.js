const booru = require('booru')
const { Command } = require('discord-akairo')
const { stripIndent, stripIndents } = require('common-tags')

const RATINGS = {
  's': 'Safe',
  'q': 'Questionable',
  'e': 'Explicit',
  'u': 'N/A'
}

class BooruCommand extends Command {
  constructor () {
    super('booru', {
      aliases: ['booru', 'b'],
      description: 'Shows you random images from booru sites, using gelbooru by default.',
      args: [
        {
          id: 'list',
          match: 'flag',
          prefix: ['--list', '-l'],
          description: 'Lists all available booru sites and their aliases.'
        },
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        },
        {
          id: 'site',
          match: 'prefix',
          prefix: ['--site=', '-s='],
          description: 'Uses a specific booru site instead of the default.'
        },
        {
          id: 'tags',
          match: 'rest',
          description: 'Tags to be used as search keywords, separated by space.'
        },
        {
          id: 'defaultSite',
          match: 'prefix',
          prefix: ['--defaultSite=', '--default='],
          description: 'Changes the default site used when not using "--site" flag. New value will be saved to storage.'
        }
      ],
      options: {
        usage: 'booru [ --list | [--site] tags | --defaultSite= ]'
      }
    })

    this.storage = null

    this.defaultSite = 'gelbooru.com'
  }

  async exec (message, args) {
    if (args.list) {
      const sites = Object.keys(booru.sites)
      const padding = ' '.repeat(sites.reduce((a, v) => (a > v.length) ? a : v.length, 0))

      const lines = sites.map(site => {
        const aliases = booru.sites[site].aliases ? booru.sites[site].aliases.join(', ') : null
        return this.client.util.pad(padding, site) + ' :: ' + (aliases || '<no aliases>')
      })

      const formatted = stripIndents`
        ${this.client.util.pad(padding, 'Sites')} :: Aliases
        ${'='.repeat(lines.reduce((a, v) => (a > v.length) ? a : v.length, padding.length + 11))}
        ${lines.join('\n')}
      `

      return message.edit('🖼\u2000Available booru sites:\n' + this.client.util.formatCode(formatted, 'asciidoc'))
    }

    if (args.defaultSite) {
      if (!this.getSiteKey(args.defaultSite)) {
        return message.status.error('The site you specified is unavailable!')
      }
      this.storage.set('defaultSite', args.defaultSite)
      this.storage.save()
      return message.status.success(`Successfully changed default site to \`${args.defaultSite}\`!`)
    }

    const site = args.site || this.defaultSite
    const siteKey = this.getSiteKey(site)
    if (!siteKey) {
      return message.status.error('The site you specified is unavailable!')
    }

    const tags = args.tags ? args.tags.split(' ') : []
    const mappedTags = tags.length ? tags.map(t => `\`${t}\``).join(', ') : null

    const searchMessage = mappedTags
      ? `Searching for random image matching tags ${mappedTags} from \`${siteKey}\`\u2026`
      : `Searching for random image from \`${siteKey}\`\u2026`
    await message.status.progress(searchMessage)

    const images = await booru
      .search(site, tags, {
        limit: 1,
        random: true
      })
      .then(images => booru.commonfy(images))
      .catch(error => {
        if (error.name === 'BooruError') {
          return message.status.error(error.message)
        } else {
          throw new Error(error) // Let commandError.js catch this
        }
      })

    const image = images[0]
    const imageUrl = this.client.util.cleanUrl(image.common.file_url)
    const title = mappedTags
      ? `Random image matching tags ${mappedTags} from \`${siteKey}\`:`
      : `Random image from \`${siteKey}\`:`

    await message.edit(stripIndent`
      🖼\u2000${title}
      •  **Score:** ${image.common.score}
      •  **Rating:** ${RATINGS[image.common.rating]}
      •  **Source:** ${image.common.source ? `<${image.common.source}>` : 'N/A'}

      ${imageUrl}
    `)
  }

  getSiteKey (site) {
    return Object.keys(booru.sites)
      .find(key => (key === site || (booru.sites[key].aliases && booru.sites[key].aliases.includes(site))))
  }

  onReady () {
    this.storage = this.client.storage('booru')

    const defaultSite = this.storage.get('defaultSite')
    if (defaultSite) {
      this.defaultSite = defaultSite
    }
  }

  onReload () {
    this.storage.save()
  }
}

module.exports = BooruCommand
