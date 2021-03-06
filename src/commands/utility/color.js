const { stripIndent } = require('common-tags')
const Canvas = require('canvas')
const colors = require('color-name')
const convert = require('color-convert')
const LCommand = require('./../../struct/LCommand')

const WIDTH = 50
const HEIGHT = 50

class ColorCommand extends LCommand {
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
          match: 'option',
          flag: ['--width=', '-w='],
          description: `Specify a width in pixels (defaults to ${WIDTH}). When used without a color, saves value.`
        },
        {
          id: 'height',
          match: 'option',
          flag: ['--height=', '-h='],
          description: `Specify a height in pixels (defaults to ${HEIGHT}). When used without a color, saves value.`
        },
        {
          id: 'dimension',
          match: 'option',
          flag: ['--dimension=', '--dim=', '-d=', '--size=', '-s='],
          description: 'Specify a square dimension in pixels (will ignore "width" and "height" options). When used without a color, saves value.'
        },
        {
          id: 'list',
          match: 'flag',
          flag: ['--list', '-l'],
          description: 'Lists saved values (width, height and dimension).'
        }
      ],
      usage: 'color < --list | {options} | [{options}] input >',
      examples: [
        'color #ffffff',
        'color rgb(0, 0, 0)',
        'color hsl(0, 100%, 50%)',
        'color cmyk(100%, 100%, 100%, 100%)',
        'color blue',
        {
          content: 'color --width=200',
          description: 'Saves width of 200 pixels into storage. Next time the command will keep on using this width for preview image.'
        },
        {
          content: 'color --width=100 blue',
          description: 'Displays and converts the color blue, also uses width of 200 pixels for preview image, but only this once.'
        },
        {
          content: 'color --width=null',
          description: 'Removes saved width value from storage.'
        }
      ]
    })

    this.storage = null
  }

  async run (message, args) {
    if (args.list)
      return message.edit('🖌\u2000Color configuration preview:\n' + this.client.util.formatCode(stripIndent`
        Width     :: ${String(this.storage.get('width'))}
        Height    :: ${String(this.storage.get('height'))}
        Dimension :: ${String(this.storage.get('dimension'))}
      `, 'asciidoc'))

    if (!args.input) {
      const keys = ['width', 'height', 'dimension']
      const saved = []
      for (const key of keys) {
        if (!args[key]) continue
        const value = args[key] === 'null' ? undefined : Number(args[key])
        this.storage.set(key, value)
        saved.push(key)
      }
      if (saved.length) {
        const content = saved.map(key => `\`${key}\` = \`${this.storage.get(key)}\``).join('\n')
        return message.status('success', `Successfully saved these new values:\n${content}`)
      }
      return message.status('error', 'You must specify a color input.')
    }

    const parsed = this.parseInput(args.input)
    if (!parsed)
      return message.status('error', 'Could not parse the input color.')

    const width = Number(args.dimension) || Number(args.width) ||
      this.storage.get('dimension') || this.storage.get('width') ||
      WIDTH
    const height = Number(args.dimension) || Number(args.height) ||
      this.storage.get('dimension') || this.storage.get('height') ||
      HEIGHT

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
    // TODO: hsv, ansi and ansi16
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
    if (hexColorRegex.test(value))
      return {
        type: 'hex',
        value: value.slice(1)
      }

    const rgbColorRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
    const rgbColorMatch = rgbColorRegex.exec(value)
    if (rgbColorMatch)
      return {
        type: 'rgb',
        value: [
          Number(rgbColorMatch[1]),
          Number(rgbColorMatch[2]),
          Number(rgbColorMatch[3])
        ]
      }

    const hslHwbColorRegex = /^(hsl|hwb)\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
    const hslHwbColorMatch = hslHwbColorRegex.exec(value)
    if (hslHwbColorMatch)
      return {
        type: hslHwbColorMatch[1],
        value: [
          Number(hslHwbColorMatch[2]),
          Number(hslHwbColorMatch[3]),
          Number(hslHwbColorMatch[4])
        ]
      }

    const cmykColorRegex = /^cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
    const cmykColorMatch = cmykColorRegex.exec(value)
    if (cmykColorMatch)
      return {
        type: 'cmyk',
        value: [
          Number(cmykColorMatch[1]),
          Number(cmykColorMatch[2]),
          Number(cmykColorMatch[3]),
          Number(cmykColorMatch[4])
        ]
      }

    if (colors[value])
      return {
        type: 'keyword',
        value
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

  onReady () {
    this.storage = this.client.storage('color')
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = ColorCommand
