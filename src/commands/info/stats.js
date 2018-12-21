const { stripIndent } = require('common-tags')
const LCommand = require('./../../struct/LCommand')
const os = require('os')

class StatsCommand extends LCommand {
  constructor () {
    super('stats', {
      aliases: ['statistics', 'stats'],
      description: 'Shows you stats about Lightbringer.',
      selfdestruct: 30,
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
            •  **Heap:** ${this.client.util.getPrettyBytes(process.memoryUsage().heapUsed)}
            •  **Heartbeat:** \`${this.client.ping.toFixed(0)}ms\`
            •  **Uptime:** ${this.client.util.humanizeDuration(Date.now() - this.client.startTimestamp, 2, true)}
            •  **Platform:** ${os.platform()}-${os.arch()}
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
            •  **Lightbringer:** [${this.client.data.package.version}](${this.git})
            •  **discord.js:** [${require('discord.js').version}](https://github.com/hydrabolt/discord.js)
            •  **discord-akairo:** [${require('discord-akairo').version}](https://github.com/1Computer1/discord-akairo)
            •  **Modules:** ${modules.toLocaleString()}
            •  **Prefix:** \`${this.client.commandHandler.prefix}\`
          `
        }
      ],
      inline: true,
      author: {
        name: 'Lightbringer Statistics',
        icon: 'https://i.fiery.me/Ec8h.png'
      },
      color: '#ff0000',
      footer: `Currently caching ${this.client.users.size.toLocaleString()} users | ${this.selfdestruct(true)}`
    }

    if (os.platform() !== 'win32') {
      embed.fields[0].value += '\n'
      embed.fields[0].value += stripIndent`
        •  **Load:** ${os.loadavg().map(load => load.toFixed(1)).join(', ')}
      `
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
    if (this.client.data.package.repository)
      this.git = `https://github.com/${this.client.data.package.repository.replace(/^github:/, '')}`
  }
}

module.exports = StatsCommand
