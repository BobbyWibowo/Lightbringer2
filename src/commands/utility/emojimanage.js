const LCommand = require('./../../struct/LCommand')

const EMOJI_REGEX = /<a?:[a-zA-Z0-9_]+:(\d+)>/

class EmojiManageCommand extends LCommand {
  constructor () {
    super('emojimanage', {
      aliases: ['emojimanage', 'emotemanage', 'emojim', 'emotem'],
      description: 'Manage emojis of the current guild',
      args: [
        {
          id: 'action',
          match: 'phrase',
          type: (phrase, message, args) => {
            if (/^a(dd)?|c(reate)?$/.test(phrase)) { return 1 }
            if (/^d(el(ete)?)?|r(em(ove)?)?$/.test(phrase)) { return 2 }
            if (/^r(en(ame)?)?$/.test(phrase)) { return 3 }
            return null
          },
          description: 'Can be "add", "create", "delete", "remove" or "rename". Add/create action will create the emoji in the currently viewed guild, while delete/remove and rename actions will delete/rename the emoji globally unless the resolvable is only a name (instead of an ID or the emoji itself).'
        },
        {
          id: 'name',
          match: 'phrase',
          description: 'With add/create action, this must be the name that will be used as a new emoji. With delete/remove and rename actions, this can be an emoji resolvable (ID, name or the emoji itself). Using name (for delete/remove/rename actions) will make the command only search for emojis in the currently viewed guild. It is also not case-sensitive and do not have to be typed in full.'
        },
        {
          id: 'extra',
          match: 'rest',
          description: 'With add/create action, this must be the URL of the image that will be used as a new emoji. With rename action, this must be the new name.'
        }
      ],
      usage: 'emojis <action> <resolvable> [extra]',
      examples: [
        'emojimanage add emojiname http://url/to/image',
        'emojimanage delete emojiname',
        'emojimanage rename emojiname newemojiname'
      ]
    })
  }

  async exec (message, args) {
    if ((args.action === 1 || args.action === 3) && !message.guild) {
      return message.status('error', 'You must be in a guild when using this command with add/create action.')
    }

    if (!args.action || ((args.action === 1 || args.action === 3) && !args.extra)) {
      return message.status('error', `Usage: \`${this.usage}\`.`)
    }

    if (args.action === 1) {
      const exec = /^<?(.+?)>?$/.exec(args.extra)
      if (!exec || !exec[1]) {
        return message.status('error', 'Could not parse input.')
      }
      args.extra = exec[1].trim()

      const result = await this.client.util.snek(args.extra)
      if (result.status !== 200) {
        return message.status('error', result.text)
      }

      await message.guild.emojis.create(result.body, args.name)
      return message.status('success', `Created an emoji named \`${args.name}\`.`)
    } else if (args.action === 2 || args.action === 3) {
      let emoji
      const match = EMOJI_REGEX.exec(args.name)
      if (match && match[1]) {
        emoji = this.client.emojis.get(match[1])
      } else {
        emoji = this.client.util.resolveEmojis(args.name, message.guild.emojis).first()
      }

      if (!emoji) {
        return message.status('error', `Could not find emoji with keyword \`${args.name}\`.`)
      }

      const oldName = emoji.name
      if (args.action === 2) {
        await emoji.delete()
        return message.status('success', `Successfully deleted an emoji named: \`${oldName}\`.`)
      } else if (args.action === 3) {
        await emoji.setName(args.extra)
        return message.status('success', `Successfully renamed emoji \`${oldName}\` to \`${args.extra}\`.`)
      }
    }
  }
}

module.exports = EmojiManageCommand
