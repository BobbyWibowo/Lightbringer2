const { Command } = require('discord-akairo')

class UploadCommand extends Command {
  constructor () {
    super('upload', {
      aliases: ['upload', 'up'],
      description: 'Uploads an image from a URL as an attachment.',
      args: [
        {
          id: 'name',
          match: 'prefix',
          prefix: ['--name=', '-n=']
        },
        {
          id: 'url'
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
      return message.status.error(`Usage: \`${this.options.usage}\`.`)
    }

    const exec = /^<?(.+?)>?$/.exec(args.url)
    let attachment

    if (exec) {
      await message.status.progress(message.content)
      const result = await this.client.util.snek(exec[1])
      if (result.status !== 200) {
        return message.status.error(result.text)
      }
      attachment = result.body
    } else {
      return message.status.error('Could not parse input!')
    }

    const file = { attachment }

    if (args.name) {
      file.name = args.name
    }

    await message.channel.send({
      files: [ file ]
    })
    await message.delete()
  }
}

module.exports = UploadCommand
