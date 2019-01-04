const LCommand = require('./../../struct/LCommand')
const Logger = require('./../../util/Logger')

const ACTIVITY_TYPES = {
  PLAYING: /^p(lay(ing)?)?$/i,
  STREAMING: /^s(tream(ing)?)?$/i,
  LISTENING: /^l(isten(ing( to)?)?)?$/i,
  WATCHING: /^w(atch(ing)?)?$/i
}

class SetActivityCommand extends LCommand {
  constructor () {
    super('setactivity', {
      aliases: ['setactivity', 'setgame'],
      description: 'Sets your activity message (advanced version with Rich Presence support is available in "setrp" command).',
      split: 'sticky',
      args: [
        {
          id: 'list',
          match: 'flag',
          flag: ['--list', '-l']
        },
        {
          id: 'url',
          match: 'option',
          flag: ['--streaming=', '--stream=', '--url='],
          description: 'URL of the streaming activity (this flag will forcibly enables Streaming activity type).'
        },
        {
          id: 'type',
          match: 'option',
          flag: ['--type='],
          description: 'The activity type (can either be Playing, Streaming, Listening to, or Watching).',
          type: (word, message, args) => {
            const keys = Object.keys(ACTIVITY_TYPES)
            if (!word.length) return keys[0]
            for (const key of keys)
              if (ACTIVITY_TYPES[key].test(word)) return key
          }
        },
        {
          id: 'name',
          match: 'rest',
          description: 'Name of the activity that you would like to have.'
        }
      ],
      usage: 'setactivity [ --list | --streaming= [name] | [--type=] name ]'
    })

    this.storage = null
  }

  async exec (message, args) {
    if (!args.type)
      return message.status('error', 'That type is unavailable! Use `--list` flag to list all available types.')

    if (args.list)
      return message.edit(`🎮\u2000|\u2000**Available types:** ${Object.keys(ACTIVITY_TYPES).join(', ')}.`)

    const save = (vals = {}) => {
      this.storage.set('name', vals.name)
      this.storage.set('type', vals.type)
      this.storage.set('url', vals.url)
      this.storage.save()
    }

    let name = args.name
    let type = args.type
    let url = args.url

    if (url) {
      type = 'STREAMING'
      if (!/^https?:\/\//.test(url))
        url = `https://www.twitch.tv/${url}`

      if (!name)
        name = url.split('/').slice(-1)[0]
    }

    if (name) {
      save({ name, type, url })
      const activity = await this.setPresenceFromStorage()
      return message.status('success', `Successfully updated your activity message into ${this.client.util.formatActivityType(activity.type, true)} **${activity.name}**.`)
    } else {
      save()
      await this.client.user.setPresence({ activity: null })
      return message.status('success', 'Successfully cleared your activity message.')
    }
  }

  setPresenceFromStorage () {
    const name = this.storage.get('name')
    if (!name) throw new Error('Missing activity name.')

    return this.client.user.setPresence({
      activity: {
        name: this.storage.get('name'),
        type: this.storage.get('type') || 'PLAYING',
        url: this.storage.get('url') || null
      }
    }).then(presence => presence.activity)
  }

  onReady () {
    this.storage = this.client.storage('setactivity')

    if (this.storage.get('name'))
      this.setPresenceFromStorage().then(activity => {
        Logger.info(`Enabled activity: ${this.client.util.formatActivityType(activity.type, true)} ${activity.name}.`, { tag: this.id })
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

module.exports = SetActivityCommand
