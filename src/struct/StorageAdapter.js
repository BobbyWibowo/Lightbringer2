const fse = require('fs-extra')
const Logger = require('./../util/Logger')

class StorageAdapter {
  constructor (storageFile) {
    this.storageFile = storageFile

    this.data = null
    this.load()
  }

  get internal () {
    return this.data
  }

  get values () {
    return Object.values(this.data)
  }

  get keys () {
    return Object.keys(this.data)
  }

  load () {
    if (!fse.existsSync(this.storageFile)) {
      this.data = {}
      return
    }

    try {
      this.data = fse.readJSONSync(this.storageFile)
    } catch (error) {
      Logger.error(`Failed to load ${this.storageFile}.`)
      Logger.error(error)
      this.data = null
    }
  }

  save () {
    if (this.data === null)
      throw new Error('Data has yet to be loaded')

    try {
      fse.writeJSONSync(this.storageFile, this.data, { spaces: 2 })
    } catch (error) {
      Logger.error(`Failed to save data to ${this.storageFile}.`)
      Logger.error(error)
    }
  }

  get (key) {
    if (this.data === null)
      throw new Error('Data has yet to be loaded')

    if (typeof key !== 'string')
      throw new TypeError('key must be a string')

    return this.data[key]
  }

  set (key, value) {
    if (this.data === null)
      throw new Error('Data has yet to be loaded')

    if (typeof key !== 'string')
      throw new TypeError('key must be a string')

    const oldValue = this.get(key)

    if (value === undefined)
      delete this.data[key]
    else
      this.data[key] = value

    return oldValue
  }
}

module.exports = StorageAdapter
