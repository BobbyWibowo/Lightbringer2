const { Command } = require('discord-akairo')
const mathjs = require('mathjs')
const moment = require('moment')
const snekfetch = require('snekfetch')

class CurrencyCommand extends Command {
  constructor () {
    super('currency', {
      aliases: ['exchangerate', 'currency', 'curr'],
      description: 'Converts currency using exchange rates from http://fixer.io/',
      args: [
        {
          id: 'input',
          match: 'separate',
          type: 'uppercase'
        },
        {
          id: 'refresh',
          match: 'flag',
          prefix: ['--refresh', '-r']
        },
        {
          id: 'source',
          match: 'flag',
          prefix: ['--source', '-s']
        }
      ]
    })

    // Exchange rates data fetched from fixer.io
    this.data = null

    // Timeout instance
    this._timeout = null

    // Is it still updating exchange rates
    this._updatingRates = false
  }

  async exec (message, args) {
    if (args.source) {
      return message.status.success('Exchange rate provided by http://fixer.io/.', -1)
    }

    if (!this.data || args.refresh) {
      await message.status.progress('Updating exchange rate\u2026')
      await this.updateRates()

      if (args.refresh) {
        return message.status.success('Successfully updated exchange rate!')
      }
    }

    if (args.input.length < 3) {
      return message.status.error(`Usage: \`currency <value> <from> <to>\``)
    }

    const val = parseFloat(args.input[0])
    if (isNaN(val)) {
      return message.status.error('Invalid value!')
    }

    const curr1 = args.input[1]
    let curr2 = args.input[2]

    // If the 2nd input is "to", then expect
    // the 2nd currency to be in the 3rd input
    if (/^to$/i.test(curr2)) {
      if (args.input[3] !== undefined) {
        curr2 = args.input[3]
      }
    }

    const base = this.data.base
    const rates = this.data.rates

    for (const curr of [curr1, curr2]) {
      if (rates[curr] === undefined && curr !== base) {
        return message.status.error(`Currency \`${curr}\` is not available!`)
      }
    }

    let sum = val

    if (curr1 !== base) {
      sum /= rates[curr1]
    }

    if (curr2 !== base) {
      sum *= rates[curr2]
    }

    const lHand = `${mathjs.round(val, 2).toLocaleString()} ${curr1}`
    const rHand = `${mathjs.round(sum, 2).toLocaleString()} ${curr2}`

    return message.edit(`💸\u2000|\u2000${lHand} = **${rHand}**`)
  }

  async updateRates () {
    if (this._updatingRates) {
      return new Promise(resolve => setInterval(() => {
        if (!this._updatingRates) {
          resolve()
        }
      }, 1000))
    }

    this._updatingRates = true

    const result = await snekfetch.get('https://api.fixer.io/latest?base=USD')
    if (result.status !== 200) {
      throw new Error(result.text)
    }

    this.data = result.body

    // Next day, 17:00 UTC +1 (5PM CET)
    // fixer.io updates their data around 4PM CET
    const nextTimestamp = moment()
      .utcOffset('+01')
      .startOf('day')
      .add(1, 'd')
      .set('h', 17)
      .valueOf()
    this._timeout = this.client.setTimeout(() => {
      this.updateRates()
    }, nextTimestamp - new Date())

    delete this._updatingRates
  }

  onReady () {
    this.updateRates().catch(error => {
      console.error(`[currency] ${error}`)
    })
  }

  onReload () {
    this.client.clearTimeout(this._timeout)
  }
}

module.exports = CurrencyCommand
