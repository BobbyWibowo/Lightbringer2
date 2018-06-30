const { Clocks } = require('./../../util/Constants')
const LCommand = require('./../../struct/LCommand')
const moment = require('moment')

class TimeCommand extends LCommand {
  constructor () {
    super('time', {
      aliases: ['time'],
      description: 'Displays current time of a certain location (may only support cities).',
      args: [
        {
          id: 'location',
          match: 'rest',
          description: 'The location that you want to display the time of.'
        }
      ]
    })
  }

  async exec (message, args) {
    if (!args.location) {
      return message.status('error', `Usage: \`${this.usage}\`.`)
    }

    const result = await this.client.util.snek(`https://time.is/en/${args.location}`)
    if (result.status !== 200) {
      return message.status('error', 'Failed to fetch time info of the specified location.')
    }

    const text = result.text || result.body.toString()

    const parsedDate = text
      .match(/title="Click for calendar">([^]+?)<\/div>/)[1]
      .replace(/, week \d+?$/, '')
    const parsedTime = text
      .match(/<div id="twd">([^]+?)<\/div>/)[1]
      .replace(/<span id="ampm" style="font-size:21px;line-height:21px">(AM|PM)<\/span>/, ' $1')
    const parsedPlace = text
      .match(/<h1>Time in ([^]+?) now<\/h1>/)[1]

    const clockEmoji = Clocks[Number(parsedTime.split(':')[0], 10) % 12]

    const formattedTime = moment(`${parsedDate} ${parsedTime}`, 'dddd, MMMM D, YYYY HH:mm:ss A')
      .format('dddd, MMMM Do YYYY @ h:mm:ss a')

    await message.edit(`${clockEmoji} The time in '${parsedPlace}' is ${formattedTime}.`)
  }
}

module.exports = TimeCommand
