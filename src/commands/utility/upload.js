const LCommand = require('./../../struct/LCommand')
const LError = require('./../../util/LError.js')
const path = require('path')

class UploadCommand extends LCommand {
  constructor () {
    super('upload', {
      aliases: ['upload', 'upl', 'attach'],
      description: 'Uploads a file from a URL as an attachment (works for either regular files or images).',
      args: [
        {
          id: 'name',
          match: 'option',
          flag: ['--name=', '-n='],
          description: 'The command will try to parse file name from the URL, and in case of failure it will use \'tmp\'. Use this option to override the file name.'
        },
        {
          id: 'plain',
          match: 'flag',
          flag: ['--plain', '-p'],
          description: 'Plain mode. The command will not print the source URL in the message that contains the attachment.'
        },
        {
          id: 'url',
          match: 'rest',
          description: 'URL of the file.'
        }
      ],
      usage: 'upload [--name=] <url>',
      clientPermissions: ['ATTACH_FILES']
    })
  }

  async run (message, args) {
    if (!args.url)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    const exec = /^<?(.+?)>?$/.exec(args.url)
    if (!exec || !exec[1])
      return message.status('error', 'Could not parse input.')

    args.url = exec[1].trim()

    // This will only prepend a progress icon to the message.
    await message.status('progress', 'Uploading\u2026')

    const options = this.patch(args.url)
    const result = await this.client.util.fetch(args.url, options, false)
    if (result.status !== 200)
      return message.status('error', result.text)

    const parsed = path.parse(args.url)
    let extname = parsed.ext.split(/[?#]/)[0]
    // Built-in patch for Twitter's file extension
    if (extname.endsWith(':large'))
      extname = extname.slice(0, -6)

    await message.channel.send(args.plain ? null : `<${args.url}>`, {
      files: [{
        attachment: result.body,
        name: args.name || `${parsed.name}${extname}` || 'tmp'
      }]
    })
    return message.delete()
  }

  patch (url, options = {}) {
    if (/^https?:\/\/i\.pximg\.net\/img-master\//i.test(url))
      throw new LError('Pixiv URLs can not contain "img-master".')

    if (options.headers === undefined)
      options.headers = {}

    // Only apply referer patch if it was not specified beforehand
    if (options.headers.referer === undefined)
      if (/^https?:\/\/i\.pximg\.net\/img-original\//.test(url)) {
        options.headers.referer = 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=0'
      }

    return options
  }
}

module.exports = UploadCommand
