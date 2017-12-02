const fse = require('fs-extra')

class ConfigManager {
  constructor (path) {
    this.path = path
    this.config = {}
  }

  load () {
    if (!fse.existsSync(this.path)) {
      // Configuration template
      fse.outputJsonSync(this.path, {
        prefix: 'lb',
        token: '',
        statusChannel: ''
      }, { spaces: 2 })

      console.log(`Configuration template saved to: ${this.path}`)
      console.log('Please edit the file then start the bot again!')
      process.exit(0)
    }

    this.config = fse.readJSONSync(this.path)
    return this.config
  }

  _backup () {
    const backupPath = `${this.path}.${new Date().toISOString().replace(/(:|.)/g, '_')}.bak`
    fse.copySync(this.path, backupPath)
    return backupPath
  }

  save () {
    const backupPath = this._backup()
    try {
      fse.outputJsonSync(this.path, this.config, { spaces: 2 })
      fse.removeSync(backupPath)
    } catch (error) {
      console.error('Failed to save configuration file!')
    }
  }

  set (key, value) {
    this.config[String(key)] = value
    this.save()
  }
}

module.exports = ConfigManager
