const { Command } = require('discord-akairo')
const { stripIndent } = require('common-tags')

// Timeout between each polls to Last.fm
const POLL_TIMEOUT = 7500

// Maximum amount of consecutive errors
const MAX_RETRY = 3

class LastfmCommand extends Command {
  constructor () {
    super('lastfm', {
      aliases: ['lastfm'],
      description: 'Manage Last.fm scrobbling status updater.',
      args: [
        {
          id: 'toggle',
          match: 'flag',
          prefix: ['--toggle', '-t'],
          description: 'Toggle Last.fm polls. State will be saved to the configuration file.'
        },
        {
          id: 'toggleRich',
          match: 'flag',
          prefix: ['--rich', '-r'],
          description: 'Toggle Rich Presence. State will be saved to the configuration file.'
        },
        {
          id: 'monitorMode',
          match: 'flag',
          prefix: ['--monitorMode', '-m'],
          description: 'When Monitor Mode is enabled, it will keep on polling Last.fm and posting status update to status channel, but it will not update the user\'s status message. This may be useful when you want to use Spotify client on Desktop.'
        },
        {
          id: 'apiKey',
          match: 'prefix',
          prefix: ['--apikey=', '--api=', '--key='],
          description: 'Saves your Last.fm Developer API key to the storage file.'
        },
        {
          id: 'username',
          match: 'prefix',
          prefix: ['--username=', '--user='],
          description: 'Saves your Last.fm username to the storage file (required to use the API).'
        },
        {
          id: 'clientID',
          match: 'prefix',
          prefix: ['--clientid=', '--client='],
          description: 'Saves the Client ID of your Discord API Application to the storage file (required to use Rich Presence).'
        },
        {
          id: 'largeImageID',
          match: 'prefix',
          prefix: ['--largeimage=', '--large='],
          description: 'Saves the ID of the "large image" that you want to use with your Rich Presence.'
        },
        {
          id: 'smallImageID',
          match: 'prefix',
          prefix: ['--smallImage=', '--small='],
          description: 'Saves the ID of the "small image" that you want to use with your Rich Presence.'
        }
      ],
      options: {
        usage: 'lastfm [ --toggle | --rich | [--apikey=] [--username=] [--clientid=] [--largeimage=] [--smallimage=] ]'
      }
    })

    this._storageKeys = ['apiKey', 'username', 'clientID', 'largeImageID', 'smallImageID']

    this.storage = null

    // Total scrobbles fetched from Last.fm
    this.totalScrobbles = 0

    // Currently playing song
    this.artist = null
    this.trackName = null

    // Timeout instance
    this._timeout = null

    // Total consecutive errors
    this._error = 0
  }

  async exec (message, args) {
    const toggles = [
      { arg: 'toggle', key: 'enabled', string: 'Last fm status updater' },
      { arg: 'toggleRich', key: 'rich', string: 'Rich Presence', alwaysPoll: true },
      { arg: 'monitorMode', key: 'monitorMode', string: 'Monitor Mode' }
    ]

    for (const toggle of toggles) {
      if (args[toggle.arg]) {
        const val = Boolean(this.storage.get(toggle.key))
        this.storage.set(toggle.key, !val)
        this.storage.save()

        this.clearRecentTrackTimeout()
        await message.status.progress(`${!val ? 'Enabling' : 'Disabling'} ${toggle.string}\u2026`)

        if (val && !toggle.alwaysPoll) {
          // Clear activity if the mode was previously enabled
          await this.client.user.setPresence({ activity: null })
        } else {
          // Poll Last.fm if the mode was previously disabled
          // ... or if alwaysPoll is set to true
          await this.getRecentTrack()
        }

        return message.status.success(`${!val ? 'Enabled' : 'Disabled'} ${toggle.string}.`)
      }
    }

    let storageHit
    this._storageKeys.forEach(key => {
      if (args[key] !== null) {
        this.storage.set(key, args[key])
        storageHit = true
      }
    })

    if (storageHit) {
      this.storage.save()
      return message.status.success('Successfully saved new value(s) to storage file.')
    }

    await message.edit('🎵\u2000Last fm configuration preview:\n' + this.client.util.formatCode(stripIndent`
      Artist          :: ${this.artist}
      Track name      :: ${this.trackName}
      Username        :: ${this.storage.get('username')}
      Total scrobbles :: ${this.totalScrobbles}
      Enabled         :: ${String(this.storage.get('enabled'))}
      Rich Presence   :: ${String(this.storage.get('rich'))}
      Monitor Mode    :: ${String(this.storage.get('monitorMode'))}
    `, 'asciidoc'))
  }

  async setPresenceToTrack () {
    if (!this.artist || !this.trackName) {
      return
    }

    const rich = this.storage.get('rich')
    const clientID = this.storage.get('clientID')
    const username = this.storage.get('username')

    if (rich && clientID) {
      return this.client.user.setPresence({
        activity: {
          application: clientID,
          name: this.trackName,
          type: 'LISTENING',
          details: this.trackName,
          state: this.artist,
          assets: {
            largeImage: this.storage.get('largeImageID') || null,
            smallImage: this.storage.get('smallImageID') || null,
            largeText: `${this.totalScrobbles.toLocaleString()} scrobbles`,
            smallText: `User: ${username}`
          }
        }
      })
    }

    return this.client.user.setPresence({
      activity: {
        name: `${this.artist} – ${this.trackName} | ♪ Last.fm`,
        type: 'LISTENING'
      }
    })
  }

  async getRecentTrack () {
    if (!this.storage.get('enabled') || !this.storage.get('username') || !this.storage.get('apiKey')) {
      return
    }

    const result = await this.client.util.snek('http://ws.audioscrobbler.com/2.0/', {
      query: {
        method: 'user.getrecenttracks',
        format: 'json',
        user: this.storage.get('username'),
        api_key: this.storage.get('apiKey'),
        limit: 1
      }
    })

    if (result.status !== 200) {
      console.error(`[lastfm-s] ${result.text}`)
      return this.setRecentTrackTimeout(true)
    }

    const tracks = this.client.util.getProp(result, 'body.recenttracks.track')

    if (!tracks || !tracks.length) {
      return this.setRecentTrackTimeout()
    }

    this.totalScrobbles = Number(result.body.recenttracks['@attr'].total) || this.totalScrobbles

    const track = tracks[0]
    const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'

    let artist = null
    let trackName = null

    if (isNowPlaying) {
      artist = typeof track.artist === 'object' ? track.artist['#text'] : track.artist
      trackName = track.name
    }

    if (this.trackName === trackName && this.artist === artist) {
      return this.setRecentTrackTimeout()
    }

    try {
      if (!artist || !trackName) {
        this.artist = null
        this.trackName = null
        await this.client.user.setPresence({ activity: null })
        await this.client.util.sendStatus('🎵\u2000Cleared Last fm status message.')
      } else {
        const monitorMode = this.storage.get('monitorMode')
        this.artist = artist
        this.trackName = trackName
        if (!monitorMode) await this.setPresenceToTrack()
        await this.client.util.sendStatus(`🎵\u2000Last fm${monitorMode ? ' [M] ' : ''}: ${artist} – ${trackName}`)
      }
      return this.setRecentTrackTimeout()
    } catch (error) {
      console.error(`[lastfm-t] ${error}`)
      return this.setRecentTrackTimeout(true)
    }
  }

  setRecentTrackTimeout (isError) {
    if (!this.storage.get('enabled')) {
      return
    }

    if (MAX_RETRY !== undefined && MAX_RETRY > 0) {
      if (isError) {
        this._error += 1
      } else {
        this._error = 0
      }

      if (this._error >= 3) {
        this.clearRecentTrackTimeout()
        this.client.util.sendStatus(`🎵\u2000Last fm status updater stopped due to **${MAX_RETRY}** consecutive errors.`)
        this.storage.set('enabled', false)
        this.storage.save()
        return
      }
    }

    this._timeout = this.client.setTimeout(() => this.getRecentTrack(), POLL_TIMEOUT)
  }

  clearRecentTrackTimeout () {
    this.artist = null
    this.trackName = null
    this.client.clearTimeout(this._timeout)
  }

  onReady () {
    this.storage = this.client.storage('lastfm')

    if (this.storage.get('enabled') === undefined) {
      this.storage.set('enabled', true)
      this.storage.save()
    }

    if (this.storage.get('enabled')) {
      this._statusChannel = this.client.channels.get(this.storage.get('statusChannel')) || null
      this.getRecentTrack()
    }
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.clearRecentTrackTimeout()
    this.storage.save()
  }
}

module.exports = LastfmCommand
