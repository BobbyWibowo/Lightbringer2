const { stripIndent } = require('common-tags')
const LCommand = require('./../../struct/LCommand')
const Logger = require('./../../util/Logger')

const ACTIVITY_TYPES = {
  PLAYING: /^p(lay(ing)?)?$/i,
  STREAMING: /^s(tream(ing)?)?$/i,
  LISTENING: /^l(isten(ing( to)?)?)?$/i,
  WATCHING: /^w(atch(ing)?)?$/i
}

class LastfmCommand extends LCommand {
  constructor () {
    super('setrp', {
      aliases: ['setrp'],
      description: 'Sets your Rich Presence activity (simplified version without Rich Presence support is available in "setactivity" command). Notice: This command has no "remaining time" support yet.',
      args: [
        {
          id: 'toggle',
          match: 'flag',
          flag: ['--toggle', '-t'],
          description: 'Toggle. State will be saved.'
        },
        {
          id: 'clientID',
          match: 'option',
          flag: ['--clientID=', '--client='],
          description: 'Saves the Client ID of your Discord API Application.'
        },
        {
          id: 'name',
          match: 'option',
          flag: ['--name='],
          description: 'Saves the "name".'
        },
        {
          id: 'state',
          match: 'option',
          flag: ['--state='],
          description: 'Saves the "state".'
        },
        {
          id: 'details',
          match: 'option',
          flag: ['--details='],
          description: 'Saves the "details".'
        },
        {
          id: 'largeImageID',
          match: 'option',
          flag: ['--largeImage=', '--large='],
          description: 'Saves the ID of the "large image".'
        },
        {
          id: 'smallImageID',
          match: 'option',
          flag: ['--smallImage=', '--small='],
          description: 'Saves the ID of the "small image".'
        },
        {
          id: 'largeText',
          match: 'option',
          flag: ['--largeText=', '--ltext='],
          description: 'Saves the "large text".'
        },
        {
          id: 'smallText',
          match: 'option',
          flag: ['--smallText=', '--stext='],
          description: 'Saves the "small text".'
        },
        {
          id: 'unixTimestamp',
          match: 'option',
          flag: ['--unixTimestamp=', '--timestamp=', '--time='],
          description: 'Saves the "timestamp" (must be a valid UNIX timestamp). Use "now" to get current timestamp (this isn\'t the same as auto timestamp).'
        },
        {
          id: 'autoTimestamp',
          match: 'flag',
          flag: ['--autoTimestamp', '--autoTime'],
          description: 'Toggle auto timestamp. When enabled, will always use the current timestamp ("elapsed time" roughly starting from 00:00).'
        },
        {
          id: 'type',
          match: 'option',
          flag: ['--type='],
          description: 'Sets the activity type. Try "setactivity --list" to see available types.',
          type: (word, message, args) => {
            const keys = Object.keys(ACTIVITY_TYPES)
            for (const key of keys)
              if (ACTIVITY_TYPES[key].test(word)) return key
          }
        },
        {
          id: 'clearOption',
          match: 'option',
          flag: ['--clearOption=', '--clear=', '-c='],
          description: 'ID of the option to clear.'
        }
      ],
      usage: 'setrp [ --toggle | [--clientID=] [--name=] [--state=] [--details=] [--largeImage=] [--smallImage=] [--largeText=] [--smallText=] [--type=] ]'
    })

    // Multiple options may be set at a time
    this._storageKeys = ['clientID', 'name', 'state', 'details', 'largeImageID', 'smallImageID', 'largeText', 'smallText', 'unixTimestamp', 'type']

    this.storage = null
  }

  async run (message, args) {
    // Can only toggle one option at a time
    const toggles = [
      { arg: 'toggle', key: 'enabled', string: 'Rich Presence activity' },
      { arg: 'autoTimestamp', key: 'autoTimestamp', string: 'auto timestamp' }
    ]

    for (const toggle of toggles)
      if (args[toggle.arg]) {
        const val = Boolean(this.storage.get(toggle.key))
        this.storage.set(toggle.key, !val)
        this.storage.save()

        if (this.storage.get('enabled'))
          await this.setPresenceFromStorage()
        else
          await this.client.user.setPresence({ activity: null })

        return message.status('success', `${!val ? 'Enabled' : 'Disabled'} ${toggle.string}.`)
      }

    let storageHit
    this._storageKeys.forEach(key => {
      if (args[key] !== null) {
        const val = key === 'unixTimestamp' && args[key].toLowerCase() === 'now' ? new Date().getTime() : args[key]
        this.storage.set(key, val)
        storageHit = true
      }
    })

    if (storageHit) {
      this.storage.save()
      if (this.storage.get('enabled')) await this.setPresenceFromStorage()
      return message.status('success', 'Successfully saved the new value(s).')
    }

    if (args.clearOption) {
      const val = this.storage.get(args.clearOption)
      if (val === undefined) {
        return message.status('error', `Option with ID \`${args.clearOption}\` was not set.`)
      } else {
        this.storage.set(args.clearOption, null)
        if (this.storage.get('enabled')) await this.setPresenceFromStorage()
        return message.status('success', `Cleared option with ID \`${args.clearOption}\`.`)
      }
    }

    await message.edit('📖\u2000Rich Presence configuration preview:\n' + this.client.util.formatCode(stripIndent`
      Enabled       :: ${String(this.storage.get('enabled'))}
      Client ID     :: ${String(this.storage.get('clientID'))}
      Name          :: ${String(this.storage.get('name'))}
      State         :: ${String(this.storage.get('state'))}
      Details       :: ${String(this.storage.get('details'))}
      Large Image   :: ${String(this.storage.get('largeImageID'))}
      Small Image   :: ${String(this.storage.get('smallImageID'))}
      Large Text    :: ${String(this.storage.get('largeText'))}
      Small Text    :: ${String(this.storage.get('smallText'))}
      Unix Time     :: ${String(this.storage.get('unixTimestamp'))}
      Auto Time     :: ${String(this.storage.get('autoTimestamp'))}
      Activity Type :: ${this.getActivityType()}
    `, 'asciidoc'))
  }

  setPresenceFromStorage () {
    const clientID = this.storage.get('clientID')
    if (!clientID) throw new Error('Missing client ID.')

    return this.client.user.setPresence({
      activity: {
        application: clientID,
        name: this.storage.get('name') || 'Lightbringer2',
        type: this.getActivityType(),
        details: this.storage.get('details') || '',
        state: this.storage.get('state') || '',
        assets: {
          largeImage: this.storage.get('largeImageID') || null,
          smallImage: this.storage.get('smallImageID') || null,
          largeText: this.storage.get('largeText') || '',
          smallText: this.storage.get('smallText') || ''
        },
        timestamps: {
          start: this.getTimestamp()
        }
      }
    })
  }

  getActivityType () {
    return this.storage.get('type') || 'PLAYING'
  }

  getTimestamp () {
    if (this.storage.get('autoTimestamp')) return new Date().getTime()
    return this.storage.get('unixTimestamp') || null
  }

  onReady () {
    this.storage = this.client.storage('setrp')

    if (this.storage.get('enabled'))
      this.setPresenceFromStorage().then(() => {
        Logger.info('Enabled Rich Presence activity.', { tag: this.id })
      }).catch(error => {
        Logger.error(error.message, { tag: this.id })
      })
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = LastfmCommand
