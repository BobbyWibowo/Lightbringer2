const { Listener } = require('discord-akairo')
const { OnlineStatuses } = require('./../../util/Constants')
const readline = require('readline')
const { stripIndent } = require('common-tags')

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  async exec () {
    if (this.client.stats.get('initiated')) {
      console.log('Connection resumed.')
      return this.client.util.sendStatus(`🔄\u2000Connection resumed.`)
    }

    console.log('Successfully logged in.')
    console.log(stripIndent`
        Stats:
        – User: ${this.client.user.tag} (ID: ${this.client.user.id})
        – Guilds: ${this.client.guilds.size.toLocaleString()}
        – Channels: ${this.client.channels.size.toLocaleString()}
        – Modules : ${this.client.commandHandler.modules.size.toLocaleString()}
        – Prefix: ${this.client.akairoOptions.prefix}
      `)

    this.client.stats.set('messages-received', 0)
    this.client.stats.set('messages-sent', 0)
    this.client.stats.set('mentions', 0)
    this.client.stats.set('command-started', 0)

    readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ''
    }).on('line', line => {
      try {
        const restart = () => process.exit(0) // eslint-disable-line no-unused-vars
        console.log(eval(line) || 'undefined') // eslint-disable-line no-eval
      } catch (err) {
        console.error(err)
      }
    }).on('SIGINT', () => {
      process.exit(0)
    })

    console.log('Created readline interface.')
    console.log('You can now evaluate arbritary JavaScript codes straight from your terminal.')

    const {
      statusChannel,
      onlineStatus,
      autoReboot
    } = this.client.akairoOptions

    if (statusChannel) {
      this.client._statusChannel = this.client.channels.get(statusChannel)
    }

    if (OnlineStatuses.includes(onlineStatus)) {
      await this.client.user.setStatus(onlineStatus)
        .then(() => console.log(`Updated bot's online status to '${onlineStatus}'.`))
        .catch(console.error)
    }

    await this.client.user.setAFK(true)

    this.triggerCommands()
    console.log('Bot is ready.')

    this.client.stats.set('initiated', true)
    await this.client.util.sendStatus(`✅\u2000Bot is ready.`)

    if (autoReboot) {
      if (autoReboot >= 300) { // if at least 5 minutes
        this.client.setTimeout(() => {
          console.log('Shutting down bot due to auto-reboot feature.')
          process.exit(0)
        }, autoReboot * 1000)
        console.log(`Bot will shutdown in ${autoReboot} second(s) due to auto-reboot feature.`)
      } else {
        console.log('Not enabling auto-reboot feature since it was set to less than 5 minutes.')
      }
    }
  }

  triggerCommands () {
    // onReady() functions aren't async.
    // Commands are expected to wait for their own onReady()
    // when being executed before they were ready.
    const commands = this.client.commandHandler.modules

    commands.forEach(command => {
      if (typeof command.onReady === 'function') {
        command.onReady()
      }
    })
  }
}

module.exports = ReadyListener
