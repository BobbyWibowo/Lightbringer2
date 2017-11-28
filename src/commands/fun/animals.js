const { Command } = require('discord-akairo')
const snekfetch = require('snekfetch')

const ANIMALS = [
  {
    name: 'cat',
    regex: /^c(at(s)?)?$/i,
    api: 'http://thecatapi.com/api/images/get?format=xml&type=jpg,png,gif',
    action: 'regex',
    data: /<url>\s*(.+?)\s*<\/url>/i
  },
  {
    name: 'dog',
    regex: /^d(og(s)?)?$/i,
    api: 'https://random.dog/woof',
    action: 'append',
    data: 'https://random.dog/',
    exclude: /\.mp4$/i
  },
  {
    name: 'bird',
    regex: /^b(ird(s)?)?$/i,
    api: 'http://random.birb.pw/tweet/',
    action: 'append',
    data: 'http://random.birb.pw/img/'
  },
  {
    name: 'lizard',
    regex: /^l(i(zard(s)?)?)?$/i,
    api: 'https://nekos.life/api/lizard',
    action: 'json',
    data: 'url'
  }
]

const MAX_RETRY = 3

class AnimalsCommand extends Command {
  constructor () {
    super('animals', {
      aliases: ['animals', 'animal', 'a'],
      description: 'Shows you random animal picture',
      args: [
        {
          id: 'animal',
          match: 'rest',
          type: (word, message, args) => {
            for (const ANIMAL of ANIMALS) {
              if (ANIMAL.regex.test(word)) {
                return ANIMAL
              }
            }
            if (!word.length) {
              return ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
            }
          }
        },
        {
          id: 'list',
          match: 'flag',
          prefix: ['--list', '-l']
        },
        {
          id: 'upload',
          match: 'flag',
          prefix: ['--upload', '-u']
        }
      ]
    })
  }

  async exec (message, args) {
    if (args.animal === null) {
      return message.status.error('That type is not available! Use `--list` flag to list all available types!')
    }

    if (args.list) {
      return message.edit(`🐱\u2000|\u2000**Available types for \`animals\` command:** ${ANIMALS.map(a => `\`${a.name}\``).join(', ')}.`)
    }

    await message.status.progress(`Fetching a random ${args.animal.name} image\u2026`)

    let image
    let attempts = 0
    while (!image && attempts <= 3) {
      attempts++

      const result = await snekfetch.get(args.animal.api)
      if (result.status !== 200) {
        continue
      }

      let _image
      switch (args.animal.action) {
        case 'regex':
          const exec = args.animal.data.exec(result.body)
          if (exec && exec[1]) {
            _image = exec[1]
          }
          break
        case 'append':
          _image = args.animal.data + result.body
          break
        case 'json':
          _image = this.client.util.getProp(result.body, args.animal.data)
          break
        default:
          _image = result.body
      }

      // It will attempt to re-fetch till MAX_RETRY
      // if the image URL matched exclude regex
      if (args.animal.exclude && args.animal.exclude.test(_image)) {
        continue
      }

      image = _image
    }

    if (!image) {
      return message.status.error(`Failed to fetch image after ${MAX_RETRY} retries!`)
    }

    if (args.upload) {
      await message.channel.send({ files: [image] })
      await message.delete()
    } else {
      await message.edit(image)
    }
  }
}

module.exports = AnimalsCommand
