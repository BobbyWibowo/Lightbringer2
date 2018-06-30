const { escapeMarkdown } = require('discord.js').Util
const LCommand = require('./../../struct/LCommand')

class InRoleCommand extends LCommand {
  constructor () {
    super('inrole', {
      aliases: ['inrole'],
      description: 'Lists members of a specific role.',
      split: 'sticky',
      args: [
        {
          id: 'guild',
          match: 'option',
          flag: ['--guild=', '-g='],
          description: 'Tries to use role from a specific guild instead.'
        },
        {
          id: 'online',
          match: 'flag',
          flag: ['--online', '--on', '-o'],
          description: 'Lists online members only.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The role that you want to display the members of.'
        }
      ],
      usage: 'inrole [--guild=] [--online] <keyword>',
      clientPermissions: ['EMBED_LINKS']
    })

    this.maxUsersListing = 20
  }

  async exec (message, args) {
    if (!args.keyword) {
      return message.status('error', 'You must specify a role name.')
    }

    const roleSource = args.guild || message.guild || null
    if (!roleSource) {
      return message.status('error', 'You must be in a guild to run this command without "--guild" flag.')
    }

    // Assert Role.
    const role = await this.client.util.assertRole(args.keyword, roleSource)

    if (!role.members.size) {
      return message.status('error', 'The specified role has no members.')
    }

    // Check whether the keyword was a mention or not.
    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword, 1)

    let displayCapped
    let members = role.members.array()
    let memberCount = members.length

    if (args.online) {
      members = members.filter(m => m.presence.status !== 'offline')
      memberCount = members.length
    }

    // Sort members alphabetically.
    members = members.sort((a, b) => a.user.tag.localeCompare(b.user.tag))

    if ((this.maxUsersListing > 0) && (this.maxUsersListing < members.length)) {
      displayCapped = true
      members.length = this.maxUsersListing
    }

    const embed = {
      title: `${role.name} [${memberCount}]`,
      description: members.map(m => escapeMarkdown(m.user.tag, true)).join(', '),
      color: role.color !== 0 ? role.hexColor : null,
      footer: 'Consider running "membersfetch" command if members list seem incomplete.'
    }

    let content = `${args.online ? 'Online members' : 'Members'} of the role matching keyword \`${args.keyword}\`:`
    if (mention) {
      content = `${role}'s ${args.online ? 'online ' : ''}members:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      flag: `**Guild:** ${escapeMarkdown(role.guild.name)} (ID: ${role.guild.id})\n` +
        (displayCapped ? `Displaying the first ${this.maxUsersListing} members alphabetically\u2026` : ''),
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

module.exports = InRoleCommand
