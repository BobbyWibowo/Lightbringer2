const Canvas = require('canvas') // eslint-disable-line no-unused-vars
const colors = require('color-name')
const convert = require('color-convert')
const { Command } = require('discord-akairo')

const WIDTH = 50
const HEIGHT = 50

class ColorCommand extends Command {
  constructor () {
    super('color', {
      aliases: ['color', 'colour', 'c'],
      description: 'Displays and converts a color when given a hex ID, HSL value, RGB value, CYMK value, or CSS name.',
      args: [
        {
          id: 'input',
          match: 'rest',
          description: 'The input color.'
        },
        {
          id: 'width',
          match: 'prefix',
          prefix: ['--width=', '-w='],
          description: `Specify a width in pixels (defaults to ${WIDTH}).`
        },
        {
          id: 'height',
          match: 'prefix',
          prefix: ['--height=', '-h='],
          description: `Specify a height in pixels (defaults to ${HEIGHT}).`
        },
        {
          id: 'dimension',
          match: 'prefix',
          prefix: ['--dimension=', '--dim=', '-d=', '--size=', '-s='],
          description: 'Specify a square dimension in pixels (will ignore "width" and "height" options when used).'
        }
      ],
      options: {
        usage: 'color <input>',
        examples: [
          {
            content: 'color #ffffff',
            description: 'Displays and converts the color white.'
          },
          {
            content: 'color rgb(0, 0, 0)',
            description: 'Displays and converts the color black.'
          },
          {
            content: 'color hsl(0, 100%, 50%)',
            description: 'Displays and converts the color red.'
          },
          {
            content: 'color cmyk(100%, 100%, 100%, 100%)',
            description: 'Displays and converts the color black.'
          },
          {
            content: 'color blue',
            description: 'Displays and converts the color blue.'
          }
        ]
      }
    })
  }

  async exec (message, args) {
    if (!args.input) {
      return message.status.error('You must specify a color input.')
    }

    const parsed = this.parseInput(args.input)
    if (!parsed) {
      return message.status.error('Could not parse the input color.')
    }

    const width = Number(args.dimension) || Number(args.width) || WIDTH
    const height = Number(args.dimension) || Number(args.height) || HEIGHT

    const canvas = new Canvas(width, height)
    const context = canvas.getContext('2d')

    const rgb = parsed.type === 'rgb' ? parsed.value : convert[parsed.type].rgb(parsed.value)

    context.rect(0, 0, width, height)
    context.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    context.fill()

    const buffer = canvas.toBuffer()

    await message.channel.send(this.generateOutput(args.input, parsed, rgb), {
      files: [
        {
          attachment: buffer,
          name: 'color.png'
        }
      ]
    })
    return message.delete()
  }

  parseInput (value) {
    // TODO: hsv, hwb, ansi and ansi16
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
    if (hexColorRegex.test(value)) {
      return {
        type: 'hex',
        value: value.slice(1)
      }
    }

    const rgbColorRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
    const rgbColorMatch = rgbColorRegex.exec(value)
    if (rgbColorMatch) {
      return {
        type: 'rgb',
        value: [
          Number(rgbColorMatch[1]),
          Number(rgbColorMatch[2]),
          Number(rgbColorMatch[3])
        ]
      }
    }

    const hslColorRegex = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
    const hslColorMatch = hslColorRegex.exec(value)
    if (hslColorMatch) {
      return {
        type: 'hsl',
        value: [
          Number(hslColorMatch[1]),
          Number(hslColorMatch[2]),
          Number(hslColorMatch[3])
        ]
      }
    }

    const cmykColorRegex = /^cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
    const cmykColorMatch = cmykColorRegex.exec(value)
    if (cmykColorMatch) {
      return {
        type: 'cmyk',
        value: [
          Number(cmykColorMatch[1]),
          Number(cmykColorMatch[2]),
          Number(cmykColorMatch[3]),
          Number(cmykColorMatch[4])
        ]
      }
    }

    if (colors[value]) {
      return {
        type: 'keyword',
        value
      }
    }

    return false
  }

  generateOutput (input, parsed, rgb) {
    const temps = []
    let temp

    // Hex color
    temp = parsed.type === 'hex' ? parsed.value : convert[parsed.type].hex(parsed.value)
    temps.push(['Hex', `#${temp}`])

    // RGB color
    temp = rgb
    temps.push(['RGB', `rgb(${temp[0]}, ${temp[1]}, ${temp[2]})`])

    // HSL color
    temp = parsed.type === 'hsl' ? parsed.value : convert[parsed.type].hsl(parsed.value)
    temps.push(['HSL', `rgb(${temp[0]}, ${temp[1]}%, ${temp[2]}%)`])

    // CMYK color
    temp = parsed.type === 'cmyk' ? parsed.value : convert[parsed.type].cmyk(parsed.value)
    temps.push(['CMYK', `cmyk(${temp[0]}%, ${temp[1]}%, ${temp[2]}%, ${temp[3]}%)`])

    // CMYK color
    temp = parsed.type === 'keyword' ? parsed.value : convert[parsed.type].keyword(parsed.value)
    temps.push(['CSS', temp])

    return `🖌\u2000**${input}:**\n\n` + temps.map(c => `**${c[0]}:** ${c[1]}`).join('\n')
  }
}

module.exports = ColorCommand
