const { exec } = require('child_process')
const LCommand = require('./../../struct/LCommand')
const os = require('os')

const USERNAME = true

class ExecCommand extends LCommand {
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
    if (!args.command)
      return message.status('error', 'You need to specify a command to execute on the shell.')

    const outs = await new Promise((resolve, reject) => {
      const outs = []
      outs.push(`${USERNAME ? `${os.userInfo().username} ` : ''}$ ${args.command}`)
      exec(args.command, {
        timeout: 60000 // 60 seconds
      }, (error, stdout, stderr) => {
        if (stdout) outs.push(stdout)
        if (stderr) outs.push(stderr)
        if (error) outs.push(`Exit code: ${error.code}`)
        resolve(outs)
      })
    })

    await this.client.util.multiSend(message.channel, outs.join('\n'), {
      code: ''
    })
    return message.delete()
  }
}

module.exports = ExecCommand
