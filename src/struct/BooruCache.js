const booru = require('booru')

class BooruCache {
  constructor (client) {
    Object.defineProperties(this, {
      client: {
        value: client
      }
    })

    this.storage = client.storage('booru-cache')
  }

  clear () {
    this.storage.data = {}
    this.storage.save()
    return true
  }

  async get (sites, tags = []) {
    if (!this.storage) {
      throw new Error('Storage system of booru cache is not yet ready.')
    }

    if (!sites) {
      throw new Error('You must specify a booru site.')
    }

    if (!(sites instanceof Array)) { sites = [sites] }

    const stringTags = tags.join(' ')
    let matchingKey = this.storage.keys.find(key => {
      if (key === stringTags) { return true }
      const splitKey = key.split(' ')
      const equalLengths = splitKey.length === tags.length
      for (const tag of tags) { if (!splitKey.includes(tag)) { return false } }
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
          console.log(`BooruCache: ${site}: ${tags}: MISS.`)
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
              console.error(`BooruCache: ${site}: ${tags}: Error: ${error.message}`)
            })

          if (!_images || !_images.length) { return resolve(null) }

          storedSites[site] = _images
        } else {
          console.log(`BooruCache: ${site}: ${tags}: HIT.`)
        }

        const index = Math.floor(Math.random() * storedSites[site].length)
        const image = storedSites[site][index]
        storedSites[site].splice(index, 1)

        if (!image) { return resolve(null) }
        console.log(`BooruCache: ${site}: ${tags}: ${storedSites[site].length} leftover.`)
        return resolve(image)
      })
    }))

    this.storage.set(matchingKey, Object.keys(storedSites).length ? storedSites : undefined)
    this.storage.save()
    return images.filter(u => u)
  }
}

module.exports = BooruCache
