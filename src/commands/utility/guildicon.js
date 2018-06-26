const AllowedImageSizes = Array.from({ length: 8 }, (e, i) => 2 ** (i + 4))
const { Command } = require('discord-akairo')
const { CommandHandlerEvents } = require('discord-akairo').Constants
const { escapeMarkdown } = require('discord.js').Util

class GuildIconCommand extends Command {
  constructor () {
    super('guildicon', {
      aliases: ['guildicon', 'gicon', 'icon'],
      description: 'Displays full size icon of the currently viewed or a specific guild.',
      args: [
        {
          id: 'direct',
          match: 'flag',
          flag: ['--direct', '-d'],
          description: 'Uses direct URL instead of CDN URL. This may not really work properly.'
        },
        {
          id: 'plain',
          match: 'flag',
          flag: ['--plain', '-p'],
          description: 'Uses plain message (no embed).'
        },
        {
          id: 'size',
          match: 'option',
          flag: ['--size=', '-s='],
          description: 'The size that you want to use to display the icon with.',
          type: 'number'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you want to display the icon of.'
        }
      ],
      options: {
        usage: 'guildicon [--direct] [--plain] [keyword]'
      }
    })
  }

  async exec (message, args) {
    // When "--plain" flag is not used in channels where user have no permission to use embeds.
    if (!args.plain && !this.client.util.hasPermissions(message.channel, ['EMBED_LINKS'])) {
      return this.handler.emit(CommandHandlerEvents.MISSING_PERMISSIONS, message, this, 'client', ['EMBED_LINKS'])
    }

    let guild = message.guild

    // Assert Guild.
    if (args.keyword) {
      guild = await this.client.util.assertGuild(args.keyword)
    }

    const color = await this.client.guildColors.get(guild)

    let size = 2048
    if (args.size) {
      if (AllowedImageSizes.includes(args.size)) {
        size = args.size
      } else {
        return message.status('error', `The size you specified was unavailable! Try one of the following: ${AllowedImageSizes.map(s => `\`${s}\``).join(', ')}.`)
      }
    }

    // Get guild's icon.
    let iconURL = guild.iconURL({ size })

    // If could not get avatar.
    if (!iconURL) {
      return message.status('error', 'Could not get icon of the specified guild.')
    }

    // "--direct" flag.
    if (args.direct) {
      iconURL = iconURL.replace('cdn.discordapp.com', 'images.discordapp.net')
    }

    // Send a plain message when "--plain" flag is used.
    if (args.plain) {
      return message.edit(`${escapeMarkdown(guild.name)}\n${iconURL}`)
    }

    // Otherwise, build embed then send it.
    let content = 'Icon of the currently viewed guild:'
    if (args.keyword) {
      content = `Icon of the guild matching keyword \`${args.keyword}\`:`
    }

    const embed = {
      title: guild.name,
      description: `ID: ${guild.id}\n[Click here to view in a browser](${iconURL})`,
      color,
      image: iconURL,
      footer: args.size ? `Specified size: ${args.size}` : null
    }

    await message.edit(content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = GuildIconCommand
