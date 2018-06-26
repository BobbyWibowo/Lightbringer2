const booru = require('booru')
const { Command } = require('discord-akairo')
const { stripIndent, stripIndents } = require('common-tags')

const RATINGS = {
  's': 'Safe',
  'q': 'Questionable',
  'e': 'Explicit',
  'u': 'N/A'
}

const DEFAULT_SITE = 'gelbooru.com'

class BooruCommand extends Command {
  constructor () {
    super('booru', {
      aliases: ['booru', 'b'],
      description: 'Shows you random images from booru sites, using gelbooru by default.',
      args: [
        {
          id: 'list',
          match: 'flag',
          flag: ['--list', '-l'],
          description: 'Lists all available booru sites and their aliases.'
        },
        {
          id: 'last',
          match: 'flag',
          flag: ['--last'],
          description: 'Uses last used arguments.'
        },
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment.'
        },
        {
          id: 'site',
          match: 'option',
          flag: ['--site=', '-s='],
          description: 'Uses a specific booru site.'
        },
        {
          id: 'tags',
          match: 'rest',
          description: 'Tags to be used as search keywords, separated by spaces.'
        },
        {
          id: 'defaultSite',
          match: 'option',
          flag: ['--defaultSite=', '--default=', '-d='],
          description: 'Changes the default booru site used when not using "--site" option. This will be saved to the storage.'
        },
        {
          id: 'liteMode',
          match: 'flag',
          flag: ['--liteMode', '--lite'],
          description: 'Toggle lite mode. When lite mode is turned on, the command will not print extra information such as scores, ratings and sources.'
        }
      ],
      options: {
        usage: 'booru [ --list | --last | [--upload] [--site=] tags | --defaultSite= | --lite ]'
      }
    })

    this.storage = null

    this.lastArgs = null
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
        ${this.client.util.pad(padding, 'Site')} :: Aliases
        ${'='.repeat(lines.reduce((a, v) => (a > v.length) ? a : v.length, padding.length + 11))}
        ${lines.join('\n')}
      `

      return message.edit('⚙\u2000Available booru sites:\n' + this.client.util.formatCode(formatted, 'asciidoc'))
    }

    if (args.defaultSite) {
      if (args.defaultSite === 'null') {
        this.storage.set('defaultSite')
        this.storage.save()
        return message.status('success', `Successfully restored default site to the hard-coded value: ${DEFAULT_SITE}.`)
      } else if (!this.getSiteKey(args.defaultSite)) {
        return message.status('error', 'The site you specified is unavailable.')
      } else {
        this.storage.set('defaultSite', args.defaultSite)
        this.storage.save()
        return message.status('success', `Successfully changed default site to \`${args.defaultSite}\`.`)
      }
    }

    const liteMode = this.storage.get('liteMode')
    if (args.liteMode) {
      this.storage.set('liteMode', !liteMode)
      this.storage.save()
      return message.status('success', `Lite mode was successfully ${liteMode ? 'disabled' : 'enabled'}.`)
    }

    if (args.last) {
      if (!this.lastArgs) {
        return message.status('error', 'There are no saved arguments.')
      }
      args = this.lastArgs
    } else {
      this.lastArgs = args
    }

    const site = args.site || this.storage.get('defaultSite') || DEFAULT_SITE
    const siteKey = this.getSiteKey(site)
    if (!siteKey) {
      return message.status('error', 'The site you specified is unavailable.')
    }

    const tags = args.tags ? args.tags.split(' ') : []
    const mappedTags = tags.length ? tags.map(t => `\`${t}\``).join(', ') : null

    const searchMessage = mappedTags
      ? `Searching for random image matching tags ${mappedTags} from \`${siteKey}\`\u2026`
      : `Searching for random image from \`${siteKey}\`\u2026`
    await message.status('progress', searchMessage)

    const images = await this.client.booruCache.get(siteKey, tags)
    if (!images.length) {
      return message.status('error', 'Could not find any images from the booru site.')
    }

    const image = images[0]
    const imageUrl = this.client.util.cleanUrl(image.file_url)

    if (liteMode) {
      return message.edit(imageUrl)
    } else {
      const title = mappedTags
        ? `Random image matching tags ${mappedTags} from \`${siteKey}\`:`
        : `Random image from \`${siteKey}\`:`
      return message.edit(stripIndent`
        ${title}
        •  **Score:** ${image.score}
        •  **Rating:** ${RATINGS[image.rating]}
        •  **Source:** ${image.source ? `<${image.source}>` : 'N/A'}
        •  **Image:** ${imageUrl}
      `)
    }
  }

  getSiteKey (site) {
    return Object.keys(booru.sites)
      .find(key => (key === site || (booru.sites[key].aliases && booru.sites[key].aliases.includes(site))))
  }

  onReady () {
    this.storage = this.client.storage('booru')
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = BooruCommand
