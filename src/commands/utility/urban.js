const { Command } = require('discord-akairo')
const ud = require('urban-dictionary-es6')

class UrbanCommand extends Command {
  constructor () {
    super('urban', {
      aliases: ['urbandictionary', 'urban', 'u'],
      description: 'Looks up a term from Urban Dictionary.',
      args: [
        {
          id: 'index',
          type: 'integer',
          match: 'prefix',
          prefix: ['--index=', '-i='],
          description: 'Sets index of which definition to show.'
        },
        {
          id: 'keyword',
          match: 'rest'
        }
      ],
      options: {
        usage: 'urban [--index=] keyword',
        hidden: true
      },
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    return message.status('error', 'This command is still work in progress.')

    // TODO
    /* eslint-disable no-unreachable */

    let result
    if (args.keyword) {
      await message.status('progress', `Searching for \`${args.keyword}\` on Urban Dictionary\u2026`)
      result = await ud.term(args.keyword)
    } else {
      await message.status('progress', 'Looking up random definition on Urban Dictionary\u2026')
      result = await ud.random()
    }

    if (!result) {
      return message.status('error', 'Could not fetch any definition.')
    }
  }

  async displayDefinition (message, index, result, keyword) {
    // TODO
  }
}

module.exports = UrbanCommand
