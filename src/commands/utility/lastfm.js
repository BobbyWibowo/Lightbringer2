const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch') // eslint-disable-line no-unused-vars
const { stripIndent } = require('common-tags')

// Timeout between each polls to Last.fm
const POLL_TIMEOUT = 7500

// Maximum amount of consecutive errors
const MAX_RETRY = 3

// ID of prefix-type arguments that will be regarded
// as things that may be saved to storage file (temporary)
const STORAGE_KEYS = ['apiKey', 'username', 'clientID', 'largeImageID', 'smallImageID', 'statusChannel']

class LastfmCommand extends Command {
  constructor () {
    super('lastfm', {
      aliases: ['lastfm'],
      description: 'Manage Last.fm status updater',
      // These arguments are currently temporary
      args: [
        {
          id: 'toggle',
          match: 'flag',
          prefix: ['--toggle', '-t']
        },
        {
          id: 'toggleRich',
          match: 'flag',
          prefix: ['--rich', '-r']
        },
        {
          id: 'apiKey',
          match: 'prefix',
          prefix: ['--apikey=', '--api=']
        },
        {
          id: 'username',
          match: 'prefix',
          prefix: ['--username=', '--user=']
        },
        {
          id: 'clientID',
          match: 'prefix',
          prefix: ['--clientid=', '--client=']
        },
        {
          id: 'largeImageID',
          match: 'prefix',
          prefix: ['--largeimage=', '--large=']
        },
        {
          id: 'smallImageID',
          match: 'prefix',
          prefix: ['--smallImage=', '--small=']
        }
      ]
    })

    this.storage = null

    // Total scrobbles fetched from Last.fm
    this.totalScrobbles = 0

    // Full name of the currently playing song
    this.nowPlaying = ''

    // Timeout instance
    this._timeout = null

    // Is Last.fm status updater disabled
    this._disabled = true

    // Total consecutive errors
    this._error = 0
  }

  async exec (message, args) {
    if (args.toggle) {
      this.storage.set('disabled', !this.storage.get('disabled'))
      this._disabled = this.storage.get('disabled')
      this.storage.save()
      this.storage.get('disabled') ? this.clearRecentTrackTimeout() : this.getRecentTrack()
      return message.status.success(`${this.storage.get('disabled') ? 'Disabled' : 'Enabled'} Last fm status updater.`)
    }

    if (args.toggleRich) {
      this.storage.set('rich', !this.storage.get('rich'))
      this.storage.save()
      this.nowPlaying = ''
      this.getRecentTrack()
      return message.status.success(`${this.storage.get('rich') ? 'Enabled' : 'Disabled'} Rich Presence mode.`)
    }

    let storageHit

    for (const key of STORAGE_KEYS) {
      if (args[key] !== null) {
        this.storage.set(key, args[key])
        storageHit = true
      }
    }

    if (storageHit) {
      this.storage.save()
      return message.status.success('Successfully saved new value(s) to configuration file!')
    }

    await message.edit(this.client.util.formatCode(stripIndent`
      Now playing     :: ${this.nowPlaying || 'N/A'}
      Total scrobbles :: ${this.totalScrobbles}
      Disabled        :: ${String(this._disabled)}
      Rich Presence   :: ${String(this.storage.get('rich'))}
    `, 'asciidoc'))
  }

  async setPresenceToTrack (artist, trackName) {
    if (this.storage.get('rich') && this.storage.get('clientID')) {
      return this.client.user.setPresence({
        activity: {
          application: this.storage.get('clientID'),
          name: trackName,
          type: 'LISTENING',
          details: artist,
          state: `Last.fm: ${this.storage.get('username')}`,
          assets: {
            largeImage: this.storage.get('largeImageID') || null,
            smallImage: this.storage.get('smallImageID') || null,
            largeText: `Scrobbles: ${this.totalScrobbles.toLocaleString()}`,
            smallText: `Last.fm status powered by Lightbringer ${this.client.package.version}`
          }
        }
      })
    } else {
      return this.client.user.setPresence({
        activity: {
          name: `${this.nowPlaying} | ♪ Last.fm`,
          type: 'LISTENING'
        }
      })
    }
  }

  async getRecentTrack () {
    if (this._disabled || !this.storage.get('username') || !this.storage.get('apiKey')) {
      if (!this.storage.get('disabled')) {
        this.storage.set('disabled', true)
        this.storage.save()
      }
      return
    }

    let result
    try {
      result = await snekfetch.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&user=${this.storage.get('username')}&api_key=${this.storage.get('apiKey')}&limit=1`)
      if (result.status !== 200) {
        throw new Error(result.text)
      }
    } catch (error) {
      console.error(`[lastfm-s] ${error.toString()}`)
      return this.setRecentTrackTimeout(true)
    }

    const tracks = this.client.util.getProp(result, 'body.recenttracks.track')

    if (!tracks || !tracks.length) {
      return this.setRecentTrackTimeout()
    }

    this.totalScrobbles = parseInt(result.body.recenttracks['@attr'].total) || this.totalScrobbles

    const track = tracks[0]
    const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'

    let artist = ''
    let trackName = ''
    let fullName = ''

    if (isNowPlaying) {
      artist = typeof track.artist === 'object' ? track.artist['#text'] : track.artist
      trackName = track.name
      fullName = `${artist} - ${trackName}`
    }

    if (this.nowPlaying === fullName) {
      return this.setRecentTrackTimeout()
    }

    try {
      if (!artist || !trackName || !fullName) {
        this.nowPlaying = ''
        await this.client.user.setPresence({ activity: null })
        await this.client.util.sendStatus('🎵\u2000Cleared Last fm status message!')
      } else {
        this.nowPlaying = fullName
        await this.setPresenceToTrack(artist, trackName)
        await this.client.util.sendStatus(`🎵\u2000Last fm: ${fullName}`)
      }
      return this.setRecentTrackTimeout()
    } catch (error) {
      console.error(`[lastfm-t] ${error}`)
      return this.setRecentTrackTimeout(true)
    }
  }

  setRecentTrackTimeout (isError) {
    if (this._disabled) {
      return
    }

    if (MAX_RETRY !== undefined && MAX_RETRY > 0) {
      if (isError) {
        this._error += 1
      } else {
        this._error = 0
      }

      if (this._error >= 3) {
        this.client.util.sendStatus(`🎵\u2000Last.fm status updater stopped due to **${MAX_RETRY}** consecutive errors.`)
        return
      }
    }

    this._timeout = this.client.setTimeout(() => this.getRecentTrack(), POLL_TIMEOUT)
  }

  clearRecentTrackTimeout () {
    this._disabled = true
    this.client.clearTimeout(this._timeout)
    this._timeout = null
  }

  onReady () {
    this.storage = this.client.storage('lastfm')

    if (!this.storage.get('disabled')) {
      this._disabled = false
      this._statusChannel = this.client.channels.get(this.storage.get('statusChannel')) || null
      this.getRecentTrack()
    }
  }

  onReload () {
    this.clearRecentTrackTimeout()
    this.storage.save()
  }
}

module.exports = LastfmCommand
