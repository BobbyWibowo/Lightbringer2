const { Util } = require('discord.js')
const { Command } = require('discord-akairo')
const { escapeMarkdown } = Util
// const { stripIndent } = require('common-tags')

class MembersCommand extends Command {
  constructor () {
    super('members', {
      aliases: ['members', 'member'],
      description: 'Lists members of the currently viewed or a specific guild.',
      args: [
        {
          id: 'keyword',
          match: 'content',
          description: 'The guild that you want to list the members of.'
        }
      ],
      options: {
        usage: 'members [keyword]'
      },
      clientPermissions: ['EMBED_LINKS']
    })

    this.maxUsersListing = 100
  }

  async exec (message, args) {
    if (!message.guild && !args.keyword) {
      return message.status.error('You must specify a guild name when running this command outside of a guild!')
    }

    let guild = message.guild

    // Assert Guild.
    if (args.keyword) {
      guild = await this.client.util.assertGuild(args.keyword)
    }

    // Refresh GuildMemberStore.
    await guild.members.fetch()

    // const online = guild.members.filter(m => m.presence.status !== 'offline')

    let displayCapped = false
    let members = guild.members
      .array()
      .sort((a, b) => a.user.tag.localeCompare(b.user.tag))

    if ((this.maxUsersListing > 0) && (this.maxUsersListing < members.length)) {
      displayCapped = true
      members.length = this.maxUsersListing
    }

    const embed = {
      title: `${guild.name} [${guild.members.size}]`,
      description: members.map(m => escapeMarkdown(m.user.tag, true)).join(', ')
    }

    let content = `Members of the currently viewed guild:`
    if (args.keyword) {
      content = `Members of the guild which matched \`${args.keyword}\`:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**Guild ID:** ${guild.id})\n` +
        (displayCapped ? `Displaying the first ${this.maxUsersListing} users alphabetically\u2026` : ''),
      code: 'css',
      char: ', '
    })
  }

  onReady () {
    const {
      maxUsersListing
    } = this.client.akairoOptions

    if (maxUsersListing !== undefined) {
      this.maxUsersListing = maxUsersListing
    }
  }
}

module.exports = MembersCommand
