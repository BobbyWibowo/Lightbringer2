// TODO: Setup script with simple prompt I guess?

const { stripIndents } = require('common-tags')

const message = stripIndents`
  Lightbringer2

  Setup script is not yet available.
  Instead, run "yarn start" or "node src/bot.js" once, to generate a template config.json file.
  Edit the file with your desired configuration, then run "yarn start" or "node src/bot.js" again to start the bot.
`

console.log(message)
process.exit(0)
