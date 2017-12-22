const { Command } = require('discord-akairo')

class NekosCommand extends Command {
  constructor () {
    super('nekos', {
      aliases: ['nekos', 'neko'],
      description: 'Shows you random neko pictures from nekos.life.',
      args: [
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        },
        {
          id: 'lewd',
          match: 'flag',
          prefix: ['--lewd', '-l'],
          description: 'Shows lewd neko pictures instead.'
        }
      ],
      options: {
        usage: 'nekos [--upload] [--lewd]'
      }
    })
  }

  async exec (message, args) {
    const isLewd = args.lewd

    await message.status.progress(`Fetching a random ${isLewd ? 'lewd ' : ''}nekos image\u2026`)

    const result = await this.client.util.snek(`http://nekos.life/api/${isLewd ? 'lewd/' : ''}neko`)

    if (result.status !== 200) {
      return message.status.error('Failed to fetch image!')
    }

    if (args.upload) {
      await message.channel.send({ files: [result.body.neko] })
      await message.delete()
    } else {
      await message.edit(result.body.neko)
    }
  }
}

module.exports = NekosCommand
