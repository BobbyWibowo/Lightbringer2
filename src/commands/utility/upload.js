const { Command } = require('discord-akairo')

class UploadCommand extends Command {
  constructor () {
    super('upload', {
      aliases: ['upload', 'attach'],
      description: 'Uploads a file from a URL as an attachment (works for either regular files or images).',
      args: [
        {
          id: 'name',
          match: 'prefix',
          prefix: ['--name=', '-n='],
          description: 'File name for the attachment.'
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
    if (!exec) {
      return message.status('error', 'Could not parse input.')
    }

    // This will only prepend a progress icon to the message.
    await message.status('progress', message.content)

    const result = await this.client.util.snek(exec[1])
    if (result.status !== 200) {
      return message.status('error', result.text)
    }

    const file = { attachment: result.body }

    if (args.name) {
      file.name = args.name
    } else {
      const _exec = /(?:.+\/)([^#?]+)/.exec(args.url)
      if (_exec) {
        file.name = _exec[1]
      }
    }

    await message.channel.send({
      files: [ file ]
    })
    await message.delete()
  }
}

module.exports = UploadCommand
