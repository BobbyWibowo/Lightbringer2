const { Command } = require('discord-akairo')

const ACTIVITY_TYPES = {
  PLAYING: /^p(lay(ing)?)?$/i,
  STREAMING: /^s(tream(ing)?)?$/i,
  LISTENING: /^l(isten(ing( to)?)?)?$/i,
  WATCHING: /^w(atch(ing)?)?$/i
}

class SetActivityCommand extends Command {
  constructor () {
    super('setactivity', {
      aliases: ['setactivity', 'setgame'],
      description: 'Sets your activity message (can only be seen by other people).',
      split: 'sticky',
      args: [
        {
          id: 'list',
          match: 'flag',
          flag: ['--list', '-l']
        },
        {
          id: 'url',
          match: 'option',
          flag: ['--streaming=', '--stream=', '--url='],
          description: 'URL of the streaming activity (this flag will forcibly enables Streaming activity type).'
        },
        {
          id: 'type',
          match: 'option',
          flag: ['--type='],
          description: 'The type of the activity (can either be Playing, Streaming, Listening to, or Watching).',
          type: (word, message, args) => {
            const keys = Object.keys(ACTIVITY_TYPES)
            if (!word.length) { return keys[0] }
            for (const key of keys) {
              if (ACTIVITY_TYPES[key].test(word)) { return key }
            }
          }
        },
        {
          id: 'name',
          match: 'rest',
          description: 'Name of the activity that you would like to have.'
        }
      ],
      options: {
        usage: 'setactivity [ --list | --streaming= [name] | [--type=] name ]'
      }
    })
  }

  async exec (message, args) {
    if (!args.type) {
      return message.status('error', 'That type is unavailable! Use `--list` flag to list all available types.')
    }

    if (args.list) {
      return message.edit(`🎮\u2000|\u2000**Available types:** ${Object.keys(ACTIVITY_TYPES).join(', ')}.`)
    }

    let name = args.name
    let type = args.type

    if (args.url) {
      type = 'STREAMING'
      if (!name) {
        name = args.url
      }
    }

    if (name) {
      const { activity } = await this.client.user.setPresence({
        activity: {
          name,
          type,
          url: args.url || null
        }
      })
      return message.status('success', `Successfully updated your activity message into ${this.client.util.formatActivityType(activity.type, true)} **${activity.name}**.`)
    } else {
      await this.client.user.setPresence({ activity: null })
      return message.status('success', 'Successfully cleared your activity message.')
    }
  }
}

module.exports = SetActivityCommand
