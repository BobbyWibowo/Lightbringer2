const booru = require('booru')
const Logger = require('./../util/Logger')

class BooruCache {
  constructor (client, { storage }) {
    this.client = client
    this.storage = storage
    this.tag = 'BooruCache'
  }

  clear () {
    this.storage.data = {}
    this.storage.save()
    return true
  }

  async get (sites, tags = []) {
    if (!this.storage)
      throw new Error('Storage system of booru cache is not yet ready.')

    if (!sites)
      throw new Error('You must specify a booru site.')

    if (!Array.isArray(sites)) sites = [sites]

    const stringTags = tags.join(' ')
    let matchingKey = this.storage.keys.find(key => {
      if (key === stringTags) return true
      const splitKey = key.split(' ')
      const equalLengths = splitKey.length === tags.length
      for (const tag of tags) if (!splitKey.includes(tag)) return false
      return equalLengths
    })
    if (matchingKey === undefined) {
      this.storage.set(stringTags, {})
      matchingKey = stringTags
    }

    const storedSites = this.storage.get(matchingKey)
    const images = await Promise.all(sites.map(site => {
      return new Promise(async resolve => {
        if (!storedSites[site] || !storedSites[site].length) {
          Logger.log(`${site}: ${tags}: MISS.`, { tag: this.tag })
          const _images = await booru
            .search(site, tags, {
              limit: 20,
              random: true
            })
            .then(booru.commonfy)
            .then(commonfied => {
              // Only keep some common tags
              for (let i = 0; i < commonfied.length; i++) {
                // Tyvm danbooru
                if (commonfied[i].common.file_url === 'https:undefined' ||
                  commonfied[i].common.file_url === commonfied[i].common.source) {
                  commonfied[i] = null
                  continue
                }
                commonfied[i] = commonfied[i].common
                delete commonfied[i].id
                delete commonfied[i].tags
              }
              return commonfied.filter(c => c)
            })
            .catch(error => {
              Logger.error(`${site}: ${tags}: Error: ${error.message}`, { tag: this.tag })
            })

          if (!_images || !_images.length) return resolve(null)

          storedSites[site] = _images
        } else {
          Logger.info(`${site}: ${tags}: HIT.`, { tag: this.tag })
        }

        const index = Math.floor(Math.random() * storedSites[site].length)
        const image = storedSites[site][index]
        storedSites[site].splice(index, 1)

        if (!image) return resolve(null)
        Logger.log(`BooruCache: ${site}: ${tags}: ${storedSites[site].length} leftover.`, { tag: this.tag })
        return resolve(image)
      })
    }))

    this.storage.set(matchingKey, Object.keys(storedSites).length ? storedSites : undefined)
    this.storage.save()
    return images.filter(u => u)
  }
}

module.exports = BooruCache
