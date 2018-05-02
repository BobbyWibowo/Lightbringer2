const { Command } = require('discord-akairo')
const { stripIndent } = require('common-tags')

class StatsCommand extends Command {
  constructor () {
    super('stats', {
      aliases: ['statistics', 'stats'],
      description: 'Shows you stats about Lightbringer.',
      clientPermissions: ['EMBED_LINKS']
    })

    this.git = null
  }

  async exec (message, args) {
    let modules = 0

    modules += this.client.commandHandler.modules.size
    modules += this.client.inhibitorHandler.modules.size
    modules += this.client.listenerHandler.modules.size

    const embed = {
      fields: [
        {
          name: 'System',
          value: stripIndent`
            •  **Node.js:** [${process.versions.node}](${process.release.sourceUrl})
            •  **Heap:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
            •  **Heartbeat:** \`${this.client.ping.toFixed(0)}ms\`
            •  **Uptime:** ${this.client.util.humanizeDuration(Date.now() - this.client.startTimestamp, 2, true)}
          `
        },
        {
          name: 'Statistics',
          value: stripIndent`
            •  **Sent:** ${this.client.stats.get('messages-sent').toLocaleString()}
            •  **Received:** ${this.client.stats.get('messages-received').toLocaleString()}
            •  **Executed:** ${this.client.stats.get('commands-started').toLocaleString()}
            •  **Guilds:** ${this.client.guilds.size.toLocaleString()}
            •  **Channels:** ${this.client.channels.size.toLocaleString()}
          `
        },
        {
          name: 'Others',
          value: stripIndent`
            •  **Lightbringer:** [${this.client.package.version}](${this.git})
            •  **discord.js:** [${require('discord.js').version}](https://github.com/hydrabolt/discord.js)
            •  **discord-akairo:** [${require('discord-akairo').version}](https://github.com/1Computer1/discord-akairo)
            •  **Modules:** ${modules.toLocaleString()}
            •  **Prefix:** \`${this.client.akairoOptions.prefix}\`
          `
        }
      ],
      inline: true,
      author: {
        name: 'Lightbringer Statistics',
        icon: 'https://a.safe.moe/F2a1H.png'
      },
      color: '#ff0000',
      footer: `Currently caching ${this.client.users.size.toLocaleString()} users.`
    }

    if (this.git !== null) {
      embed.description = `[Click here](${this.git}) to view this self-bot's public GitHub repository.`
      embed.author.url = this.git
    }

    await message.edit(message.content, {
      embed: this.client.util.embed(embed)
    })
  }

  onReady () {
    if (this.client.package.repository) {
      this.git = 'https://github.com/' + this.client.package.repository.replace(/^github:/, '')
    }
  }
}

module.exports = StatsCommand
