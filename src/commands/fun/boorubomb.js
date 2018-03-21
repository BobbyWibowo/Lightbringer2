const booru = require('booru')
const { Command } = require('discord-akairo')
const { stripIndents } = require('common-tags')

const DEFAULT_SITES = [
  'gelbooru.com',
  'konachan.com',
  'konachan.net',
  'yande.re'
]

class BooruCommand extends Command {
  constructor () {
    super('boorubomb', {
      aliases: ['boorubomb', 'bb', 'hentaibomb'],
      description: 'Shows you a total of 4 random images from different booru sites (using gelbooru.com, konachan.com, konachan.net and yande.re by default).',
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
          description: 'Uploads the images as attachments.'
        },
        {
          id: 'sites',
          match: 'prefix',
          prefix: ['--sites=', '-s='],
          description: 'Uses a specific set of booru site, separated by commas. Technically there is no limit to how many sites you can use, unless you want to use "--upload" flag, then it will be limited by the amount of images you can attach into a single message.'
        },
        {
          id: 'tags',
          match: 'rest',
          description: 'Tags to be used as search keywords, separated by spaces. This may prevent some sites from returning any results due to incompatibilities between each booru sites.'
        },
        {
          id: 'defaultSites',
          match: 'prefix',
          prefix: ['--defaultSites=', '--default=', '-d='],
          description: 'Changes the default set of booru sites used when not using "--sites" option. This will be saved to the storage.'
        }
      ],
      options: {
        usage: 'boorubomb [ --list | [--upload] [--sites=] tags | --defaultSites= ]'
      }
    })

    this.storage = null
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

    if (args.defaultSites) {
      if (args.defaultSites === 'null') {
        this.storage.set('defaultSites')
        this.storage.save()
        return message.status.success(`Successfully restored default sites to the hard-coded value: ${this.inline(DEFAULT_SITES)}.`)
      }
      const defaultSites = args.defaultSites.split(',')
      const invalids = defaultSites.map(s => [s, this.getSiteKey(s)]).filter(s => !s[1]).map(s => s[0])
      if (invalids.length) {
        return message.status.error(`Unavailable sites: ${this.inline(invalids)}.`)
      }
      this.storage.set('defaultSites', defaultSites)
      this.storage.save()
      return message.status.success(`Successfully changed default sites to: ${this.inline(defaultSites)}.`)
    }

    const sites = (args.sites ? args.sites.split(',') : null) || this.storage.get('defaultSites') || DEFAULT_SITES
    const siteKeys = sites.map(this.getSiteKey).filter(k => k)
    if (!siteKeys.length) {
      return message.status.error('The sites you specified are unavailable.')
    }

    const tags = args.tags ? args.tags.split(' ') : []

    const searchMessage = tags.length
      ? `Searching for random images matching tags ${this.inline(tags)} from various booru sites\u2026`
      : `Searching for random images from various booru sites\u2026`
    await message.status.progress(searchMessage)

    const imageUrls = []
    for (let i = 0; i < siteKeys.length; i++) {
      const images = await booru
        .search(siteKeys[i], tags, {
          limit: 1,
          random: true
        })
        .then(images => booru.commonfy(images))
        .catch(() => {})
      if (images) {
        const image = images[0]
        const imageUrl = this.client.util.cleanUrl(image.common.file_url)
        imageUrls.push(imageUrl)
      }
    }

    if (!imageUrls.length) {
      return message.status.error('Could not find any images from the booru sites.')
    }

    return message.edit(imageUrls.join('\n\n'))
  }

  inline (array) {
    return array.map(v => `\`${v}\``).join(', ')
  }

  getSiteKey (site) {
    return Object.keys(booru.sites)
      .find(key => (key === site || (booru.sites[key].aliases && booru.sites[key].aliases.includes(site))))
  }

  onReady () {
    this.storage = this.client.storage('boorubomb')
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = BooruCommand
