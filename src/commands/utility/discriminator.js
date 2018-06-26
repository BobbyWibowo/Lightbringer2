const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class DiscriminatorCommand extends Command {
  constructor () {
    super('discriminator', {
      aliases: ['discriminator', 'discrim'],
      description: 'Lists usernames with the specified discriminator.',
      args: [
        {
          id: 'discriminator',
          match: 'rest',
          type: (word, message, args) => {
            if (/^\d{4}$/.test(word)) { return word }
          }
        }
      ],
      options: {
        usage: 'discriminator <discriminator>',
        examples: [
          'discriminator 0001'
        ]
      }
    })

    this.maxUsersListing = null
  }

  async exec (message, args) {
    if (!args.discriminator) {
      return message.status('error', `Usage: \`${this.options.usage}\`.`)
    }

    let displayCapped = false
    const users = this.client.users.filter(u => u.discriminator === args.discriminator).array()
    const userCount = users.length

    if ((this.maxUsersListing > 0) && (this.maxUsersListing < users.length)) {
      displayCapped = true
      users.length = this.maxUsersListing
    }

    const embed = {
      title: `#${args.discriminator} [${userCount}]`,
      description: users.map(u => escapeMarkdown(u.tag, true)).join(', ')
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content: `Users with discriminator \`#${args.discriminator}\`:`,
      flag: displayCapped ? `Displaying the first ${this.maxUsersListing} users\u2026` : '',
      code: 'css',
      char: ', '
    })
  }

  onReady () {
    const maxUsersListing = this.client.configManager.get('maxUsersListing')

    if (maxUsersListing !== undefined) {
      this.maxUsersListing = Number(maxUsersListing)
    }
  }
}

module.exports = DiscriminatorCommand
