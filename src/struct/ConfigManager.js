const fse = require('fs-extra')
const { OnlineStatuses } = require('./../util/Constants')

class ConfigManager {
  constructor (path) {
    this._path = path

    this._config = {}

    this._validKeys = {
      prefix: {
        default: 'lb'
      },
      token: {
        protected: true // This is only protected by the get/set functions
      },
      statusChannel: {},
      onlineStatus: {
        default: 'idle',
        allowed: OnlineStatuses
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
      console.log(`Configuration template saved to: ${this._path}`)
      console.log('Please edit the file then start the bot again!')
      return process.exit(0)
    }

    try {
      this._config = fse.readJSONSync(this._path)
      return this._config
    } catch (error) {
      console.error(error)
      return process.exit(1)
    }
  }

  _backup () {
    const backupPath = `${this._path}.${new Date().toISOString().replace(/(:|.)/g, '_')}.bak`
    fse.copySync(this._path, backupPath)
    return backupPath
  }

  save () {
    try {
      const backupPath = this._backup()
      fse.outputJsonSync(this._path, this._config, { spaces: 2 })
      fse.removeSync(backupPath)
    } catch (error) {
      console.error(error)
      throw new Error('Failed to save configuration file. Check your console!')
    }
  }

  get (key) {
    if (this._validKeys[key] === undefined) {
      throw new Error('The key you specified is not valid!')
    }

    if (this._validKeys[key].protected) {
      return `<protected>`
    }

    return this._config[key]
  }

  set (key, value) {
    if (this._validKeys[key] === undefined) {
      throw new Error('The key you specified is not valid!')
    }

    if (this._validKeys[key].protected) {
      throw new Error('The key you specified is protected!')
    }

    const allowed = this._validKeys[key].allowed
    if (allowed && !allowed.includes(value)) {
      throw new Error('The key you specified can only be one of the following values: ' + allowed.join(', ') + '.')
    }

    this._config[String(key)] = value
    this.save()
  }

  getKeys () {
    return this._validKeys
  }
}

module.exports = ConfigManager
