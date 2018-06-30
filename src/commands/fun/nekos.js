const LCommand = require('./../../struct/LCommand')

class NekosCommand extends LCommand {
  constructor () {
    super('nekos', {
      aliases: ['nekos', 'neko', 'nyaa'],
      description: 'Shows you random neko pictures from nekos.life.',
      args: [
        {
          id: 'upload',
          match: 'flag',
          flag: ['--upload', '-u'],
          description: 'Uploads the image as an attachment instead.'
        },
        {
          id: 'lewd',
          match: 'flag',
          flag: ['--lewd', '-l'],
          description: 'Shows lewd neko pictures instead.'
        }
      ],
      usage: 'nekos [--upload] [--lewd]'
    })
  }

  async exec (message, args) {
    const isLewd = args.lewd

    await message.status('progress', `Fetching a random ${isLewd ? 'lewd ' : ''}nekos image\u2026`)

    const result = await this.client.util.snek(`https://nekos.life/api/v2/img/${isLewd ? 'lewd' : 'neko'}`)

    if (result.status !== 200) {
      return message.status('error', 'Failed to fetch image.')
    }

    if (args.upload) {
      await message.channel.send({ files: [result.body.url] })
      await message.delete()
    } else {
      await message.edit(result.body.url)
    }
  }
}

module.exports = NekosCommand
