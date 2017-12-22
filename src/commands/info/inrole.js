const { Command } = require('discord-akairo')
const { escapeMarkdown } = require('discord.js').Util

class InRoleCommand extends Command {
  constructor () {
    super('inrole', {
      aliases: ['inrole'],
      description: 'Lists members of a specific role.',
      args: [
        {
          id: 'guild',
          match: 'prefix',
          prefix: ['--guild=', '-g='],
          description: 'Tries to use role from a specific guild instead.'
        },
        {
          id: 'online',
          match: 'flag',
          prefix: ['--online', '--on', '-o'],
          description: 'Lists online members only.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The role that you want to display the members of.'
        }
      ],
      options: {
        usage: 'inrole [--guild=] [--online] <keyword>'
      },
      clientPermissions: ['EMBED_LINKS']
    })

    this.maxUsersListing = 20
  }

  async exec (message, args) {
    if (!args.keyword) {
      return message.status.error('You must specify a role name!')
    }

    const roleSource = args.guild || message.guild || null
    if (!roleSource) {
      return message.status.error('You must be in a guild to run this command without "--guild" flag!')
    }

    // Assert Role.
    const role = await this.client.util.assertRole(args.keyword, roleSource)

    // Refresh GuildMemberStore.
    await message.status.progress('Refreshing guild members\u2026')
    await role.guild.members.fetch()

    // Check whether the keyword was a mention or not.
    const mention = this.client.util.isKeywordMentionable(args.keyword, 1)

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
      color: role.hexColor
    }

    let content = `${args.online ? 'Online members' : 'Members'} of the role which matched \`${args.keyword}\`:`
    if (mention) {
      content = `${role}'s ${args.online ? 'online ' : ''}members:`
    }

    return this.client.util.multiSendEmbed(message.channel, embed, {
      firstMessage: message,
      content,
      prefix: `**Guild:** ${escapeMarkdown(role.guild.name)} (ID: ${role.guild.id})\n` +
        (displayCapped ? `Displaying the first ${this.maxUsersListing} members alphabetically\u2026` : ''),
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

module.exports = InRoleCommand
