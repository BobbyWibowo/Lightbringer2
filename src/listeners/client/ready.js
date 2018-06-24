const { Listener } = require('discord-akairo')
const { OnlineStatuses } = require('./../../util/Constants')
const readline = require('readline')
const { stripIndent } = require('common-tags')
const Logger = require('./../../util/Logger')

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  async exec () {
    if (this.client.stats.get('initiated')) {
      Logger.info('Connection resumed.')
      return this.client.util.sendStatus('🔄\u2000Connection resumed.')
    }

    delete this.client.user.verified
    delete this.client.user.email

    Logger.log('Successfully logged in.')
    Logger.log(stripIndent`
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
        // eslint-disable-next-line no-unused-vars
        const restart = () => process.exit(0)
        // eslint-disable-next-line no-eval
        Logger.log(eval(line) || 'undefined')
      } catch (error) {
        Logger.error(error)
      }
    }).on('SIGINT', () => {
      process.exit(0)
    })

    Logger.log('Created readline interface.')
    Logger.log('You can now evaluate arbritrary JavaScript codes straight from your terminal.')
    Logger.log('For PM2 users, you can use: pm2 send lb2 "ARBRITRARY JAVASCRIPT CODES".')

    const statusChannel = this.client.configManager.get('statusChannel')
    const onlineStatus = this.client.configManager.get('onlineStatus')
    const autoReboot = this.client.configManager.get('autoReboot')

    if (statusChannel) {
      this.client._statusChannel = this.client.channels.get(statusChannel)
    }

    if (OnlineStatuses.includes(onlineStatus)) {
      await this.client.user.setStatus(onlineStatus)
        .then(() => Logger.info(`Updated bot's online status to '${onlineStatus}'.`))
        .catch(Logger.stacktrace)
    }

    await this.client.user.setAFK(true)

    this.triggerOnReadyFunctions()

    this.client.stats.set('initiated', true)
    Logger.info('Bot is ready.')
    await this.client.util.sendStatus('✅\u2000Bot is ready.')

    if (autoReboot) {
      if (autoReboot >= 300) { // if at least 5 minutes
        this.client.setTimeout(() => {
          Logger.info('Shutting down bot due to auto-reboot feature.')
          process.exit(0)
        }, autoReboot * 1000)
        Logger.info(`Bot will shutdown in ${autoReboot} second(s) due to auto-reboot feature.`)
      } else {
        Logger.info('Not enabling auto-reboot feature since it was set to less than 5 minutes.')
      }
    }
  }

  triggerOnReadyFunctions () {
    // NOTE: This is an odd structure. This in itself is a module,
    // but it is required to trigger all the other modules' onReady function.

    this.client.commandHandler.modules.forEach(m => {
      if (typeof m.onReady === 'function') { m.onReady() }
    })

    this.client.inhibitorHandler.modules.forEach(m => {
      if (typeof m.onReady === 'function') { m.onReady() }
    })

    this.client.listenerHandler.modules.forEach(m => {
      if (typeof m.onReady === 'function') { m.onReady() }
    })
  }
}

module.exports = ReadyListener
