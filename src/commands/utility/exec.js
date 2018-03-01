const { Command } = require('discord-akairo')
const { exec } = require('child_process')

class ExecCommand extends Command {
  constructor () {
    super('exec', {
      aliases: ['exec', 'e', 'shell'],
      description: 'Execute a command on the shell.',
      args: [
        {
          id: 'command',
          match: 'rest',
          description: 'The command that you want to execute.'
        }
      ]
    })
  }

  async exec (message, args) {
    if (!args.command) {
      return message.status.error('You need to specify a command to execute on the shell.')
    }

    const outs = await new Promise((resolve, reject) => {
      const outs = [`$ ${args.command}`]
      exec(args.command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        }

        if (stdout) {
          outs.push(stdout)
        }

        if (stderr) {
          outs.push(stderr)
        }

        if (error === null) {
          resolve(outs)
        }
      })
    })

    await this.client.util.multiSend(message.channel, outs.join('\n'), {
      code: ''
    })
    return message.delete()
  }
}

module.exports = ExecCommand
