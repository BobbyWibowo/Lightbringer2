const { Command } = require('discord-akairo')
const { stripIndent } = require('common-tags')

class StatsCommand extends Command {
  constructor () {
    super('stats', {
      aliases: ['statistics', 'stats'],
      description: 'Shows you stats about Lightbringer.',
      clientPermissions: ['EMBED_LINKS']
    })
  }

  async exec (message, args) {
    if (!this.options.git && this.client.package.repository) {
      this.options.git = 'https://github.com/' + this.client.package.repository.replace(/^github:/, '')
    }

    const embed = {
      fields: [
        {
          name: 'System',
          value: stripIndent`
            •  **Node.js:** [${process.versions.node}](${process.release.sourceUrl})
            •  **Heap:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
            •  **Heartbeat:** ${this.client.ping.toFixed(0)} ms
            •  **Uptime:** ${this.client.util.humanizeDuration(this.client.uptime, 2, true)}
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
            •  **Lightbringer:** [${this.client.package.version}](${this.options.git})
            •  **discord.js:** [${require('discord.js').version}](https://github.com/hydrabolt/discord.js)
            •  **discord-akairo:** [${require('discord-akairo').version}](https://github.com/1Computer1/discord-akairo)
            •  **Modules:** ${this.client.commandHandler.modules.size.toLocaleString()}
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
      footer: `Ps. Currently caching ${this.client.users.size.toLocaleString()} users\u2026`
    }

    if (this.options.git) {
      embed.description = `*[Click here](${this.options.git}) to view this self-bot's public GitHub repository\u2026*`
      embed.author.url = this.options.git
    }

    await message.edit(message.content, {
      embed: this.client.util.embed(embed)
    })
  }
}

module.exports = StatsCommand
