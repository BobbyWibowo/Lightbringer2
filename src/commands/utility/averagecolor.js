const convert = require('color-convert')
const LCommand = require('./../../struct/LCommand')

class AverageColorCommand extends LCommand {
  constructor () {
    super('averagecolor', {
      aliases: ['averagecolors', 'averagecolor', 'avgcolor'],
      description: 'Calculate the average color of an image (input must be an URL). For the time being, this only accepts PNG, JPG or BMP images.',
      args: [
        {
          id: 'url',
          match: 'rest',
          description: 'URL of the image.'
        }
      ],
      usage: 'averagecolor <url>'
    })
  }

  async run (message, args) {
    if (!args.url)
      return message.status('error', `Usage: \`${this.usage}\`.`)

    const exec = /^<?(.+?)>?$/.exec(args.url)

    if (!exec)
      return message.status('error', 'Could not parse input.')

    // This will only prepend a progress icon to the message.
    await message.status('progress', message.content)

    const result = await this.client.util.fetch(exec[1])
    if (result.status !== 200)
      return message.status('error', result.text)

    const color = await this.client.util.getAverageColor(result.body).then(convert.rgb.hex)

    return message.edit(`**Source:** <${exec[1]}>\n**Result:** #${color}`)
  }
}

module.exports = AverageColorCommand
