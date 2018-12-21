const fse = require('fs-extra')
const path = require('path')
const StorageAdapter = require('./StorageAdapter')

class Storage {
  constructor ({ directory }) {
    if (!fse.existsSync(directory))
      fse.mkdirSync(directory)

    const cache = {}
    const factory = function (file) {
      let realPath = path.resolve(directory, file)
      if (!realPath.endsWith('.json')) realPath += '.json'
      return cache[file] || (cache[file] = new StorageAdapter(realPath))
    }

    factory.saveAll = this.saveAll.bind(this)
    return factory
  }

  saveAll () {
    for (const key in this.cache)
      this.cache[key].save()
  }
}

module.exports = Storage
