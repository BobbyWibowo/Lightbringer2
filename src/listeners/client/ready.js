const { Listener } = require('discord-akairo')
const readline = require('readline')
const { stripIndents } = require('common-tags')

class ReadyListener extends Listener {
  constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  async exec () {
    if (this.client.stats.get('initiated')) {
      console.log('Connection resumed!')
    } else {
      console.log('Successfully logged in!')
      console.log(stripIndents`
        Stats:
        - User: ${this.client.user.tag} (ID: ${this.client.user.id})
        - Guilds: ${this.client.guilds.size.toLocaleString()}
        - Channels: ${this.client.channels.size.toLocaleString()}
        - Modules : ${this.client.commandHandler.modules.size.toLocaleString()}
        - Prefix: ${this.client.akairoOptions.prefix}
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
          const restart = () => process.exit() // eslint-disable-line no-unused-vars
          console.log(eval(line) || 'undefined') // eslint-disable-line no-eval
        } catch (err) {
          console.error(err)
        }
      }).on('SIGINT', () => {
        process.exit(0)
      })

      console.log('Created readline interface.')
      console.log('You can now evaluate arbritary JavaScript codes straight from your terminal.')
      console.log('Bot is ready!')
      this.client.stats.set('initiated', true)
    }
  }
}

module.exports = ReadyListener
