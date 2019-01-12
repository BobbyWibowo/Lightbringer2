const { escapeMarkdown } = require('discord.js').Util
const LCommand = require('./../../struct/LCommand')

class MembersCommand extends LCommand {
  constructor () {
    super('members', {
      aliases: ['members', 'member'],
      description: 'Lists members of the currently viewed or a specific guild.',
      args: [
        {
          id: 'online',
          match: 'flag',
          flag: ['--online', '--on', '-o'],
          description: 'Lists online members only.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you want to list the members of.'
        }
      ],
      usage: 'members [--online] [keyword]',
      selfdestruct: 60,
      clientPermissions: ['EMBED_LINKS']
    })

    this.maxUsersListing = 20
  }

  async run (message, args) {
    if (!message.guild && !args.keyword)
      return message.status('error', 'You must specify a guild name when running this command outside of a guild.')

    let guild = message.guild

    // Assert Guild.
    if (args.keyword)
      guild = await this.client.util.assertGuild(args.keyword)

    const color = await this.client.guildColors.get(guild)

    let displayCapped = false
    let members = guild.members.array()
    let memberCount = members.length

    if (args.online) {
      members = members.filter(m => m.presence.status !== 'offline')
      memberCount = members.length
    }

    // Sort members by their activity (their last message's timestamp).
    members = members.sort((a, b) => {
      const aTime = a.lastMessage ? (a.lastMessage.editedTimestamp || a.lastMessage.createdTimestamp) : 0
      const bTime = b.lastMessage ? (b.lastMessage.editedTimestamp || b.lastMessage.createdTimestamp) : 0
      return bTime - aTime || a.user.tag.localeCompare(b.user.tag)
    })

    if ((this.maxUsersListing > 0) && (this.maxUsersListing < members.length)) {
      displayCapped = true
      members.length = this.maxUsersListing
    }

    const embed = {
      title: `${guild.name} [${memberCount}]`,
      description: members.map(m => escapeMarkdown(m.user.tag, true)).join(', '),
      footer: `Use "memfetch" to refresh members cache | ${this.sd(true)}`,
      color
    }

    let content = `${args.online ? 'Online members' : 'Members'} of the currently viewed guild:`
    if (args.keyword)
      content = `${args.online ? 'Online members' : 'Members'} of the guild matching keyword \`${args.keyword}\`:`

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**Guild ID:** ${guild.id}\n` +
        (displayCapped ? `Displaying the first ${this.maxUsersListing} active members\u2026` : ''),
      code: 'css',
      char: ', '
    })
  }

  onReady () {
    const maxUsersListing = this.client.configManager.get('maxUsersListing')

    if (maxUsersListing !== undefined)
      this.maxUsersListing = Number(maxUsersListing)
  }
}

module.exports = MembersCommand
