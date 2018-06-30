const LCommand = require('./../../struct/LCommand')
const ud = require('urban-dictionary-es6')

class UrbanCommand extends LCommand {
  constructor () {
    super('urban', {
      aliases: ['urbandictionary', 'urban', 'u'],
      description: 'Looks up a term from Urban Dictionary.',
      args: [
        {
          id: 'index',
          type: 'integer',
          match: 'option',
          flag: ['--index=', '-i='],
          description: 'Sets index of which definition to show.'
        },
        {
          id: 'keyword',
          match: 'rest'
        }
      ],
      usage: 'urban [--index=] keyword',
      hidden: true,
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
