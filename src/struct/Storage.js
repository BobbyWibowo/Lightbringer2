const path = require('path')
const StorageAdapter = require('./StorageAdapter')

class Storage {
  /**
   * Creates an instance of Storage.
   * @param {any} client
   * @memberof Storage
   */
  constructor (client) {
    Object.defineProperties(this, {
      client: {
        value: client
      }
    })

    const {
      storageDirectory = './../storage/'
    } = client.akairoOptions

    const cache = this.cache = {}

    const factory = function (file) {
      let realPath = path.resolve(storageDirectory, file)
      if (!realPath.endsWith('.json')) {
        realPath += '.json'
      }

      return cache[file] || (cache[file] = new StorageAdapter(realPath))
    }

    factory.saveAll = this.saveAll.bind(this)

    return factory
  }

  saveAll () {
    for (const key in this.cache) {
      this.cache[key].save()
    }
  }
}

module.exports = Storage
