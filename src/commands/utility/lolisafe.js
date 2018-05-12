const { Command } = require('discord-akairo')
const path = require('path')

const DEFAULT_URL = 'https://safe.fiery.me/api/upload'

class LoliSafeCommand extends Command {
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
          match: 'prefix',
          prefix: ['--extension=', '--ext=', '-e='],
          description: 'The command will try to parse an extension from the URL, and in case of failure it will not have an extension. Use this option to override the extension.'
        },
        {
          id: 'site',
          match: 'prefix',
          prefix: ['--site=', '-s='],
          description: 'Full URL to the upload API of a lolisafe-based host. This will be saved to the storage.'
        },
        {
          id: 'token',
          match: 'prefix',
          prefix: ['--token=', '-t='],
          description: 'Token for the lolisafe-based host. This will be saved to the storage.'
        },
        {
          id: 'album',
          match: 'prefix',
          prefix: ['--album=', '-a='],
          description: 'Album ID for the lolisafe-based host. This will be saved to the storage.'
        }
      ],
      options: {
        usage: 'lolisafe < url | --site= | --token= >'
      }
    })

    this.storage = null

    this.url = DEFAULT_URL

    this.token = null

    this.album = null
  }

  async exec (message, args) {
    if (args.site) {
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
    } else if (args.token) {
      if (args.token === 'null') {
        this.storage.set('token')
        this.storage.save()
        this.token = null
        return message.status('success', 'Successfully removed token from the storage file.')
      } else {
        this.storage.set('token', args.token)
        this.storage.save()
        this.token = args.token
        return message.status('success', 'Successfully saved token to the storage file.')
      }
    } else if (args.album) {
      if (args.album === 'null') {
        this.storage.set('token')
        this.storage.save()
        this.album = null
        return message.status('success', 'Successfully removed album ID from the storage file.')
      } else {
        this.storage.set('album', args.album)
        this.storage.save()
        this.album = args.album
        return message.status('success', 'Successfully saved album ID to the storage file.')
      }
    } else if (!args.url) {
      return message.status('error', `Usage: \`${this.options.usage}\`.`)
    }

    const exec = /^<?(.+?)>?$/.exec(args.url)
    if (!exec || !exec[1]) {
      return message.status('error', 'Could not parse input.')
    }
    args.url = exec[1].trim()

    await message.status('progress', `Uploading to \`${this.client.util.getHostName(this.url)}\`\u2026`)

    const options = {}
    if (/^https?:\/\/i\.pximg\.net\/img-original\//.test(args.url)) {
      options.headers = {
        referer: 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=0'
      }
    }
    const download = await this.client.util.snek(args.url, options)
    if (download.status !== 200) {
      return message.status('error', download.text)
    }

    if (args.ext && !args.ext.startsWith('.')) {
      args.ext = `.${args.ext}`
    }

    const parsed = path.parse(args.url)
    const extname = parsed.ext.split(/[?#]/)[0]
    const filename = `${parsed.name || 'tmp'}${args.ext || extname}`
    const result = await this.client.util.snekfetch
      .post(this.url)
      .set('Content-Type', 'multipart/form-data')
      .set({
        token: this.token,
        albumid: this.album
      })
      .attach('files[]', download.body, filename)

    if (result.status !== 200) {
      return message.status('error', result.text)
    }

    if (!result.body.success) {
      return message.status('error', `Failed to upload <${this.url}>: \`${result.body.description.code}\`.`)
    }

    return message.edit(result.body.files[0].url)
  }

  onReady () {
    this.storage = this.client.storage('lolisafe')

    const url = this.storage.get('url')
    if (url) {
      this.url = url
    }

    const token = this.storage.get('token')
    if (token) {
      this.token = token
    }

    const album = this.storage.get('album')
    if (album) {
      this.album = album
    }
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = LoliSafeCommand
