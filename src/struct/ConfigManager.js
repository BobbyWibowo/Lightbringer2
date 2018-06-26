const { OnlineStatuses } = require('./../util/Constants')
const fse = require('fs-extra')
const Logger = require('./../util/Logger')

class ConfigManager {
  constructor (path) {
    this._path = path

    this._config = {}

    this._validKeys = {
      prefix: {
        default: 'lb'
      },
      token: {},
      statusChannel: {},
      onlineStatus: {
        default: 'idle',
        allowed: OnlineStatuses
      },
      maxUsersListing: {
        default: 20,
        cast: 'number'
      },
      autoReboot: {
        default: null,
        cast: 'number'
      },
      homeGuild: {
        default: null
      }
    }
  }

  _template () {
    const template = {}
    for (const key of Object.keys(this._validKeys)) {
      if (this._validKeys[key].default !== undefined) {
        template[key] = this._validKeys[key].default
      } else {
        template[key] = ''
      }
    }
    return template
  }

  load () {
    if (!fse.existsSync(this._path)) {
      fse.outputJsonSync(this._path, this._template(), { spaces: 2 })
      Logger.info(`Configuration template saved to: ${this._path}`)
      Logger.info('Please edit the file then start the bot again.')
      return process.exit(0)
    }

    try {
      this._config = fse.readJSONSync(this._path)
      return true
    } catch (error) {
      Logger.error(error.stack || error)
      return process.exit(1)
    }
  }

  _backup () {
    const backupPath = `${this._path}.${new Date().toISOString().replace(/(:|.)/g, '_')}.bak`
    fse.copySync(this._path, backupPath)
    return backupPath
  }

  _cast (to, value) {
    switch (to) {
      case 'number':
        if (value === 'null') { return null }
        return Number(value)
      case 'boolean':
        return Boolean(value)
    }
  }

  save () {
    try {
      const backupPath = this._backup()
      fse.outputJsonSync(this._path, this._config, { spaces: 2 })
      fse.removeSync(backupPath)
    } catch (error) {
      Logger.error(error.stack || error)
      throw new Error('Failed to save configuration file. Check your console.')
    }
  }

  get (key) {
    if (this._validKeys[key] === undefined) {
      throw new Error('The key you specified is INVALID.')
    }

    return this._config[key]
  }

  set (key, value) {
    if (this._validKeys[key] === undefined) {
      throw new Error('The key you specified is INVALID.')
    }

    const allowed = this._validKeys[key].allowed
    if (allowed && !allowed.includes(value)) {
      throw new Error(`The key you specified can only be one of the following values: ${allowed.join(', ')}.`)
    }

    const cast = this._validKeys[key].cast
    if (cast) {
      value = this._cast(cast, value)
    }

    this._config[String(key)] = value
    this.save()
  }

  getKeys () {
    return this._validKeys
  }
}

module.exports = ConfigManager
