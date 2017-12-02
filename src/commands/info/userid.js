const { Collection } = require('discord.js')
const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class UserIdCommand extends Command {
  constructor () {
    super('userid', {
      aliases: ['userid', 'uid'],
      description: 'Shows yours or another user\'s ID.',
      args: [
        {
          id: 'keyword',
          match: 'rest',
          description: 'The user that you want to display the ID of.'
        }
      ]
    })
  }

  async exec (message, args) {
    /*
     * Refresh GuildMemberStore
     */

    if (message.guild) {
      await message.status.progress('Refreshing guild members information\u2026')
      await message.guild.members.fetch()
    }

    let user

    /*
     * Resolve GuildMember or User
     */

    if (args.keyword) {
      const resolved = this.client.util.resolveMemberOrUser(
        args.keyword,
        message.guild ? message.guild.members : null
      )

      if (resolved.failed) {
        return message.status.error('Could not find matching users!')
      }

      if ((resolved.member || resolved.user) instanceof Collection) {
        return message.status.error(
          this.client.util.formatMatchesList(resolved.member || resolved.user),
          { timeout: this.client.util.matchesListTimeout }
        )
      }

      user = resolved.user
    } else {
      user = message.author
    }

    const mention = this.client.util.isKeywordMentionable(args.keyword)

    await message.edit(`${mention ? user : escapeMarkdown(user.tag)}'s ID: ${user.id}`)
  }
}

module.exports = UserIdCommand
