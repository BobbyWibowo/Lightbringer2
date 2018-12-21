const LCommand = require('./../../struct/LCommand')
const path = require('path')
const fetch = require('node-fetch')
const FormData = require('form-data')

const DEFAULT_URL = 'https://safe.fiery.me/api/upload'

class LoliSafeCommand extends LCommand {
  constructor () {
    super('lolisafe', {
      aliases: ['lolisafe', 'safe', 's'],
      description: `Uploads a file from a URL to a lolisafe-based host (defaults to ${DEFAULT_URL}).`,
      args: [
        {
          id: 'url',
          match: 'rest',
          description: 'URL of the file.'
        },
        {
          id: 'ext',
          match: 'option',
          flag: ['--extension=', '--ext=', '-e='],
          description: 'The command will try to parse an extension from the URL, and in case of failure it will not have an extension. Use this option to override the extension.'
        },
        {
          id: 'site',
          match: 'option',
          flag: ['--site=', '-s='],
          description: 'Full URL to the upload API of a lolisafe-based host. This will be saved.'
        },
        {
          id: 'token',
          match: 'option',
          flag: ['--token=', '-t='],
          description: 'Token for the lolisafe-based host. This will be saved.'
        },
        {
          id: 'album',
          match: 'option',
          flag: ['--album=', '-a='],
          description: 'Album ID for the lolisafe-based host. This will be saved.'
        },
        {
          id: 'clearOption',
          match: 'option',
          flag: ['--clearOption=', '--clear=', '-c='],
          description: 'ID of the option to clear.'
        }
      ],
      usage: 'lolisafe < url | --site= | --token= >'
    })

    this.storage = null

    this.url = DEFAULT_URL

    this.token = null

    this.album = null
  }

  async exec (message, args) {
    if (args.site)
      if (args.site === 'null') {
        this.storage.set('site')
        this.storage.save()
        this.url = DEFAULT_URL
        return message.status('success', `Successfully restored site to <${this.url}>.`)
      } else if (!/^https?:\/\//.test(args.site)) {
        return message.status('error', 'Site did not start with a valid protocol (HTTP/HTTPS).')
      } else {
        this.storage.set('site', args.site)
        this.storage.save()
        this.url = args.site
        return message.status('success', `Successfully updated site to <${this.url}>.`)
      }

    if (args.token)
      if (args.token === 'null') {
        this.storage.set('token')
        this.storage.save()
        this.token = null
        return message.status('success', 'Successfully removed token.')
      } else {
        this.storage.set('token', args.token)
        this.storage.save()
        this.token = args.token
        return message.status('success', 'Successfully saved token.')
      }

    if (args.album)
      if (args.album === 'null') {
        this.storage.set('token')
        this.storage.save()
        this.album = null
        return message.status('success', 'Successfully removed album ID.')
      } else {
        this.storage.set('album', args.album)
        this.storage.save()
        this.album = args.album
        return message.status('success', 'Successfully saved album ID.')
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

    if (!args.url)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    const exec = /^<?(.+?)>?$/.exec(args.url)
    if (!exec || !exec[1])
      return message.status('error', 'Could not parse input.')

    args.url = exec[1].trim()

    await message.status('progress', `Uploading to \`${this.client.util.getHostName(this.url)}\`\u2026`)

    const options = this.patch(args.url)
    const download = await this.client.util.fetch(args.url, options, false)
    if (download.status !== 200)
      return message.status('error', download.text)

    if (args.ext && !args.ext.startsWith('.'))
      args.ext = `.${args.ext}`

    const parsed = path.parse(args.url)
    let extname = args.ext || parsed.ext.split(/[?#]/)[0]
    // Built-in patch for Twitter's file extension
    if (extname.endsWith(':large'))
      extname = extname.slice(0, -6)

    const filename = `${parsed.name || 'tmp'}${extname}`

    const form = new FormData()
    form.append('files[]', download.body, {
      filename
    })

    const fetchPost = await fetch(this.url, {
      method: 'POST',
      headers: {
        token: this.token,
        albumid: this.album
      },
      body: form
    })

    if (fetchPost.status !== 200)
      return message.status('error', `${fetchPost.status} ${fetchPost.statusText}`)

    const result = await fetchPost.json()
    if (!result.success)
      return message.status('error', `Failed to upload <${this.url}>: \`${result.body.description.code}\`.`)

    let _url = result.files[0].url

    // Fun patch for safe.fiery.me (use will-always-want.me domain)
    if (this.url === DEFAULT_URL) {
      let subdomain = 'everyone'
      if (/neko/i.test(args.url)) subdomain = 'nekos'
      if (/(azur|lane)/i.test(args.url)) subdomain = 'ship-girls'
      if (/loli/i.test(args.url)) subdomain = 'lolis'
      _url = _url.replace(/i\.fiery\.me/g, `${subdomain}.will-always-want.me`)
    }

    return message.edit(_url)
  }

  patch (url, options) {
    // Use patch function of "upload" command, if available
    const uploadCommand = this.handler.modules.get('upload')
    if (!uploadCommand) return null
    return uploadCommand.patch(url, options)
  }

  onReady () {
    this.storage = this.client.storage('lolisafe')

    const url = this.storage.get('url')
    if (url)
      this.url = url

    const token = this.storage.get('token')
    if (token)
      this.token = token

    const album = this.storage.get('album')
    if (album)
      this.album = album
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = LoliSafeCommand
