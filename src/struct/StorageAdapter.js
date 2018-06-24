const fse = require('fs-extra')
const Logger = require('./../util/Logger')

class StorageAdapter {
  /**
   * Creates an instance of StorageAdapter.
   * @param {string} storageFile The path to the file to save and load from
   *
   * @memberof StorageAdapter
   */
  constructor (storageFile) {
    /**
     * @type {string} The path to the storage file.
     */
    this.storageFile = storageFile

    /**
     * @type {object} The internal data storage
     */
    this.data = null
    this.load()
  }

  get internal () {
    return this.data
  }

  /**
   * An array of values.
   *
   * @type {any[]}
   *
   * @readonly
   *
   * @memberof StorageAdapter
   */
  get values () {
    return Object.values(this.data)
  }

  /**
   * An array of keys.
   *
   * @type {string[]}
   *
   * @readonly
   *
   * @memberof StorageAdapter
   */
  get keys () {
    return Object.keys(this.data)
  }

  /**
   * Loads the data from the storage file.
   *
   * @returns
   *
   * @memberof StorageAdapter
   */
  load () {
    if (!fse.existsSync(this.storageFile)) {
      this.data = {}
      return
    }

    try {
      this.data = fse.readJSONSync(this.storageFile)
    } catch (error) {
      Logger.error(`Failed to load ${this.storageFile}.`)
      Logger.stacktrace(error)
      this.data = null
    }
  }

  /**
   * Saves the data to the storage file.
   *
   * @memberof StorageAdapter
   */
  save () {
    if (this.data === null) {
      throw new Error('Data has yet to be loaded')
    }

    try {
      fse.writeJSONSync(this.storageFile, this.data, { spaces: 2 })
    } catch (error) {
      Logger.error(`Failed to save data to ${this.storageFile}.`)
      Logger.stacktrace(error)
    }
  }

  /**
   * Gets a value.
   *
   * @param {string} key The key of the property to retrieve.
   * @returns {any} The value present at the given key.
   *
   * @memberof StorageAdapter
   */
  get (key) {
    if (this.data === null) {
      throw new Error('Data has yet to be loaded')
    }

    if (typeof key !== 'string') {
      throw new TypeError('key must be a string')
    }

    return this.data[key]
  }

  /**
   * Sets a value.
   *
   * @param {string} key The key of the property to change.
   * @param {any} value The value. If this is undefined, it will delete the property with the given key.
   * @returns {any} The original value present at the given key.
   *
   * @memberof StorageAdapter
   */
  set (key, value) {
    if (this.data === null) {
      throw new Error('Data has yet to be loaded')
    }

    if (typeof key !== 'string') {
      throw new TypeError('key must be a string')
    }

    const oldValue = this.get(key)

    if (value === undefined) {
      delete this.data[key]
    } else {
      this.data[key] = value
    }

    return oldValue
  }
}

module.exports = StorageAdapter
