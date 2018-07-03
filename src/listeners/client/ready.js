const { inspect } = require('util')
const { Listener } = require('discord-akairo')
const { OnlineStatuses } = require('./../../util/Constants')
const { stripIndent } = require('common-tags')
const Logger = require('./../../util/Logger')
const readline = require('readline')

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

    const elapsedHrTime = process.hrtime(this.client.startHrTime)
    delete this.client.startHrTime

    Logger.log(`Successfully logged in. That took ${this.client.util.formatHrTime(elapsedHrTime)}.`)
    Logger.log(stripIndent`
        Stats:
        – User: ${this.client.user.tag} (ID: ${this.client.user.id})
        – Guilds: ${this.client.guilds.size.toLocaleString()}
        – Channels: ${this.client.channels.size.toLocaleString()}
        – Modules : ${this.client.commandHandler.modules.size.toLocaleString()}
        – Prefix: ${this.client.commandHandler.prefix}
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
        if (line === '.exit') { process.exit(0) }
        // eslint-disable-next-line no-eval
        process.stdout.write(`${inspect(eval(line), { depth: 0 })}\n`)
      } catch (error) {
        process.stderr.write(error.stack || error)
      }
    }).on('SIGINT', () => {
      process.exit(0)
    })

    Logger.log('Created readline interface.')
    Logger.log('You can now evaluate arbritrary JavaScript codes straight from your terminal.')
    Logger.log('For PM2 users, you can use: pm2 send lb2 "ARBRITRARY JAVASCRIPT CODES".')

    const statusChannel = this.client.configManager.get('statusChannel')
    if (statusChannel) {
      this.client._statusChannel = this.client.channels.get(statusChannel)
    }

    await this.client.user.setAFK(true)
    const onlineStatus = this.client.configManager.get('onlineStatus')
    if (OnlineStatuses.includes(onlineStatus)) {
      await this.client.user.setStatus(onlineStatus)
        .then(() => Logger.info(`Updated bot's online status to '${onlineStatus}'.`))
        .catch(Logger.error)
    }

    const autoReboot = this.client.configManager.get('autoReboot')
    if (autoReboot) {
      if (autoReboot > 0) {
        this.client.setTimeout(() => {
          Logger.info('Shutting down bot due to auto-reboot feature.')
          process.exit(0)
        }, autoReboot * 1000)
        Logger.info(`Bot will shutdown in ${autoReboot} second(s) due to auto-reboot feature.`)
      }
    }

    Logger.info('Bot is ready.')
    await this.client.util.sendStatus('✅\u2000Bot is ready.')

    this.client.stats.set('initiated', true)
  }
}

module.exports = ReadyListener
