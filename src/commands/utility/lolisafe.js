const { Command } = require('discord-akairo')

const DEFAULT_URL = 'https://safe.fiery.me/api/upload'

class LoliSafeCommand extends Command {
  constructor () {
    super('lolisafe', {
      aliases: ['lolisafe', 'safe', 's'],
      description: `Uploads a file from a URL to a lolisafe-based host (default to ${DEFAULT_URL}).`,
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
          description: 'The command will try to parse an extension from the URL, and in case of failure it will use \'.unknown\'. Use this option to override the extension.'
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
        }
      ],
      options: {
        usage: 'lolisafe < url | --site= | --token= >'
      }
    })

    this.storage = null

    this.url = DEFAULT_URL

    this.token = null
  }

  async exec (message, args) {
    if (args.site) {
      if (args.site === 'null') {
        this.storage.set('site')
        this.storage.save()
        this.url = DEFAULT_URL
        return message.status.success(`Successfully restored site to <${this.url}>.`)
      } else if (!/^https?:\/\//.test(args.site)) {
        return message.status.error('Site did not start with a valid protocol (HTTP/HTTPS).')
      } else {
        this.storage.set('site', args.site)
        this.storage.save()
        this.url = args.site
        return message.status.success(`Successfully updated site to <${this.url}>.`)
      }
    } else if (args.token) {
      if (args.token === 'null') {
        this.storage.set('token')
        this.storage.save()
        this.token = null
        return message.status.success('Successfully removed token from the storage file.')
      } else {
        this.storage.set('token', args.token)
        this.storage.save()
        this.token = args.token
        return message.status.success('Successfully saved token to the storage file.')
      }
    } else if (!args.url) {
      return message.status.error(`Usage: \`${this.options.usage}\`.`)
    }

    const exec = /^<?(.+?)>?$/.exec(args.url)
    if (!exec) {
      return message.status.error('Could not parse input.')
    }

    const url = exec[1]

    // This will only prepend a progress icon to the message.
    await message.status.progress(message.content)

    const download = await this.client.util.snek(url)
    if (download.status !== 200) {
      return message.status.error(download.text)
    }

    let ext = 'unknown'
    if (args.ext) {
      ext = args.ext
    } else {
      const _exec = /.([\w]+)(\?|$)/.exec(url)
      if (_exec) {
        ext = _exec[1]
      }
    }

    const result = await this.client.util.snekfetch
      .post(this.url)
      .set('Content-Type', 'multipart/form-data')
      .set({ token: this.token })
      .attach('files[]', download.body, `tmp.${ext}`)

    if (result.status !== 200) {
      return message.status.error(result.text)
    }

    if (!result.body.success) {
      return message.status.error(`Failed to upload <${this.url}>: \`${result.body.description.code}\`.`)
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
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = LoliSafeCommand
