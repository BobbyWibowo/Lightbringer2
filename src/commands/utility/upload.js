const { Command } = require('discord-akairo')
const path = require('path')

class UploadCommand extends Command {
  constructor () {
    super('upload', {
      aliases: ['upload', 'upl', 'attach'],
      description: 'Uploads a file from a URL as an attachment (works for either regular files or images).',
      args: [
        {
          id: 'name',
          match: 'prefix',
          prefix: ['--name=', '-n='],
          description: 'The command will try to parse file name from the URL, and in case of failure it will use \'tmp\'. Use this option to override the file name.'
        },
        {
          id: 'plain',
          match: 'flag',
          prefix: ['--plain', '-p'],
          description: 'Plain mode. The command will not print the source URL in the message that contains the attachment.'
        },
        {
          id: 'url',
          match: 'rest',
          description: 'URL of the file.'
        }
      ],
      options: {
        usage: 'upload [--name=] <url>'
      },
      clientPermissions: ['ATTACH_FILES']
    })
  }

  async exec (message, args) {
    if (!args.url) {
      return message.status('error', `Usage: \`${this.options.usage}\`.`)
    }

    const exec = /^<?(.+?)>?$/.exec(args.url)
    if (!exec || !exec[1]) {
      return message.status('error', 'Could not parse input.')
    }
    args.url = exec[1].trim()

    // This will only prepend a progress icon to the message.
    await message.status('progress', 'Uploading URL as an attachment\u2026')

    const options = {}
    if (/^https?:\/\/i\.pximg\.net\/img-original\//.test(args.url)) {
      options.headers = {
        referer: 'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=0'
      }
    }
    const result = await this.client.util.snek(args.url, options)
    if (result.status !== 200) {
      return message.status('error', result.text)
    }

    await message.channel.send(args.plain ? null : `<${args.url}>`, {
      files: [{
        attachment: result.body,
        name: args.name || path.basename(args.url) || 'tmp'
      }]
    })
    return message.delete()
  }
}

module.exports = UploadCommand
