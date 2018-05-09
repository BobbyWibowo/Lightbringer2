const { Command } = require('discord-akairo')
const LError = require('../../util/LError')

const INHIBITOR_ID = 'guildBlacklist'

class GuildBlacklistCommand extends Command {
  constructor () {
    super('guildblacklist', {
      aliases: ['guildblacklist', 'gblacklist', 'gexclude'],
      description: 'Manage guild blacklist. The bot will not monitor any commands in blacklisted guilds. You can not add and remove at the same time.',
      split: 'sticky',
      args: [
        {
          id: 'list',
          match: 'flag',
          prefix: ['--list', '-l'],
          description: 'Lists blacklisted guilds.'
        },
        {
          id: 'add',
          match: 'prefix',
          prefix: ['--add=', '-a='],
          description: 'Adds a guild to the blacklist.'
        },
        {
          id: 'addID',
          match: 'prefix',
          prefix: ['--addID=', '-ai='],
          description: 'Adds a guild ID to the blacklist.'
        },
        {
          id: 'remove',
          match: 'prefix',
          prefix: ['--remove=', '-r=', '--delete=', '-d='],
          description: 'Removes a guild from the backlist.'
        },
        {
          id: 'removeID',
          match: 'prefix',
          prefix: ['--removeID=', '-ri=', '--deleteID=', '-di='],
          description: 'Deletes a guild ID from the blacklist.'
        },
        {
          id: 'inhibitorID',
          match: 'prefix',
          prefix: ['--inhibitorID=', '--inhibitor=', '-i'],
          description: 'ID of the inhibitor that will be called whenever a guild is being added to or removed from the blacklist (do not change this unless you know what you are doing).'
        }
      ],
      options: {
        usage: 'guildblacklist [ --list | --add= | --addID= | --remove= | --removeID= | --inhibitorID= ]',
        examples: [
          {
            content: 'guildblacklist',
            description: 'Blacklist the currently viewed guild.'
          },
          'guildblacklist --add="super guild"',
          'guildblacklist --addID=123456789012345678',
          'guildblacklist --inhibitorID=guildBlacklist'
        ]
      }
    })

    this.storage = null

    this.callback = null

    this.homeGuild = null
  }

  async exec (message, args) {
    const guilds = this.storage.get('guilds') || []

    if (args.list) {
      if (!guilds || !guilds.length) {
        return message.status('error', 'There are no blacklisted guilds.')
      }

      const char = '\n'
      const embed = {
        description: guilds.map(id => {
          const guild = this.client.guilds.get(id)
          return `•  ${guild ? `${guild.name} – ` : ''}${id}`
        }).join(char)
      }

      return this.client.util.multiSendEmbed(message.channel, embed, {
        firstMessage: message,
        content: '⚠\u2000Blacklisted guilds:',
        char
      })
    } else if (args.add || args.addID) {
      const isID = args.addID !== null
      const { id, display } = await this.resolveSingleGuild(isID ? args.addID : args.add, isID)
      if (this.homeGuild === id) {
        return message.status('error', 'You can not blacklist the bot\'s home guild.')
      }

      const index = guilds.indexOf(id)
      if (index > -1) {
        return message.status('error', `Guild \`${display}\` is already blacklisted.`)
      } else {
        guilds.push(id)
        this.stc('guilds', guilds)
        return message.status('success', `Successfully blacklisted guild \`${display}\`.`)
      }
    } else if (args.remove || args.removeID) {
      const isID = args.removeID !== null
      const { id, display } = await this.resolveSingleGuild(isID ? args.removeID : args.remove, isID)

      const index = guilds.indexOf(id)
      if (index > -1) {
        guilds.splice(index, 1)
        this.stc('guilds', guilds)
        return message.status('success', `Successfully removed guild \`${display}\` from the blacklist.`)
      } else {
        return message.status('error', `Guild \`${display}\` is not blacklisted.`)
      }
    } else if (args.inhibitorID) {
      const inhibitor = this.client.inhibitorHandler.modules.get(args.inhibitorID)

      if (inhibitor) {
        this.stc('inhibitorID', inhibitor.id)
        return message.status('success', `Successfully updated inhibitor to \`${inhibitor.id}\`.`)
      } else {
        return message.status('error', `Could not find inhibitor with ID \`${inhibitor.id}\`.`)
      }
    }

    if (!message.guild) {
      return message.status('error', 'You must use any option when running this command outside of a guild.')
    }

    const index = guilds.indexOf(message.guild.id)

    if (index > -1) {
      guilds.splice(index, 1)
    } else {
      if (this.homeGuild === message.guild.id) {
        return message.status('error', 'You can not blacklist the bot\'s home guild.')
      } else {
        guilds.push(message.guild.id)
      }
    }

    this.stc('guilds', guilds)

    if (index > -1) {
      return message.status('success', 'Successfully removed the current guild from the blacklist.')
    } else {
      return message.status('success', 'Successfully blacklisted the current guild.')
    }
  }

  async resolveSingleGuild (keyword, isID) {
    if (isID) {
      if (!/^\d+$/.test(keyword)) {
        throw new LError('Guild ID is invalid.')
      }
      return { id: keyword, display: keyword }
    } else {
      const guild = await this.client.util.assertGuild(keyword)
      return { id: guild.id, display: guild.name }
    }
  }

  stc (key, value) {
    this.storage.set(key, value)
    this.storage.save()
    this.callInhibitor()
  }

  callInhibitor () {
    const inhibitorID = INHIBITOR_ID || this.storage.get('inhibitorID')
    const inhibitor = this.client.inhibitorHandler.modules.get(inhibitorID)
    if (inhibitor && typeof inhibitor.callback === 'function') {
      inhibitor.callback()
    }
  }

  onReady () {
    const homeGuild = this.client.configManager.get('homeGuild')

    if (homeGuild) {
      this.homeGuild = homeGuild
    }

    this.storage = this.client.storage('guild-blacklist')
  }

  onReload () {
    this.onRemove()
  }

  onRemove () {
    this.storage.save()
  }
}

module.exports = GuildBlacklistCommand
