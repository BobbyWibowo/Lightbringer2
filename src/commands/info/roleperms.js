const { escapeMarkdown } = require('discord.js').Util
const { stripIndent } = require('common-tags')
const LCommand = require('./../../struct/LCommand')

const PERMISSIONS = {
  General: {
    ADMINISTRATOR: 'Administrator',
    VIEW_AUDIT_LOG: 'View Audit Log',
    MANAGE_GUILD: 'Manage Server',
    MANAGE_ROLES: 'Manage Roles',
    MANAGE_CHANNELS: 'Manage Channels',
    KICK_MEMBERS: 'Kick Members',
    BAN_MEMBERS: 'Ban Members',
    CREATE_INSTANT_INVITE: 'Create Instant Invite',
    CHANGE_NICKNAME: 'Change Nickname',
    MANAGE_NICKNAMES: 'Manage Nicknames',
    MANAGE_EMOJIS: 'Manage Emojis',
    MANAGE_WEBHOOKS: 'Manage Webhooks',
    VIEW_CHANNEL: 'Read Text Channels & See Voice Channels'
  },
  Text: {
    SEND_MESSAGES: 'Send Messages',
    SEND_TTS_MESSAGES: 'Send TTS Messages',
    MANAGE_MESSAGES: 'Manage Messages',
    EMBED_LINKS: 'Embed Links',
    ATTACH_FILES: 'Attach Files',
    READ_MESSAGE_HISTORY: 'Read Message History',
    MENTION_EVERYONE: 'Mention Everyone',
    USE_EXTERNAL_EMOJIS: 'Use External Emojis',
    ADD_REACTIONS: 'Add Reactions'
  },
  Voice: {
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute Members',
    DEAFEN_MEMBERS: 'Deafen Members',
    MOVE_MEMBERS: 'Move Members',
    USE_VAD: 'Use Voice Activity'
  }
}

class RolePermsCommand extends LCommand {
  constructor () {
    super('roleperms', {
      aliases: ['rolepermissions', 'rolepermission', 'roleperms', 'roleperm', 'rperms', 'rperm'],
      description: 'Shows permissions of a specific role.',
      split: 'sticky',
      args: [
        {
          id: 'guild',
          match: 'option',
          flag: ['--guild=', '-g='],
          description: 'Tries to display information of a role from a specific guild instead.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The role that you want to display the information of.'
        }
      ],
      usage: 'roleperms [--guild=] <keyword>',
      selfdestruct: 60,
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async run (message, args) {
    if (!args.keyword)
      return message.status('error', 'You must specify a role name.')

    const roleSource = args.guild || message.guild || null
    if (!roleSource)
      return message.status('error', 'You must be in a guild to run this command without "--guild" flag.')

    // Assert Role.
    const role = await this.client.util.assertRole(args.keyword, roleSource)

    // Check whether the keyword was a mention or not.
    const mention = args.keyword && this.client.util.isKeywordMentionable(args.keyword, 1)

    const embed = {
      title: role.name,
      description: stripIndent`
        **ID:** ${role.id}
        **Guild:** ${escapeMarkdown(role.guild.name)} (ID: ${role.guild.id})
      `,
      fields: [],
      footer: this.selfdestruct(true),
      color: role.hexColor
    }

    for (const category of Object.keys(PERMISSIONS)) {
      const permissions = Object.keys(PERMISSIONS[category])
        .map(key => {
          const name = PERMISSIONS[category][key]
          const serialized = role.permissions.serialize()
          if (serialized[key]) return `•  ${name}`
        })
        .filter(v => v)
        .join('\n')

      embed.fields.push({
        name: `${category} Permissions`,
        value: permissions || '•  N/A'
      })
    }

    // Message content (the thing being displayed above the embed).
    let content = `Permissions of the role matching keyword \`${args.keyword}\`:`
    if (mention)
      content = `${role}'s permissions:`

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = RolePermsCommand
