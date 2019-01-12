const { exec } = require('child_process')
const LCommand = require('./../../struct/LCommand')
const stripAnsi = require('strip-ansi')

class ExecCommand extends LCommand {
  constructor () {
    super('exec', {
      aliases: ['exec', 'e', 'shell'],
      description: 'Execute a command on the shell.',
      args: [
        {
          id: 'command',
          match: 'rest',
          description: 'The shell command that you want to execute.'
        }
      ],
      usage: 'exec <command>',
      selfdestruct: 60
    })
  }

  async run (message, args) {
    if (!args.command)
      return message.status('error', 'You need to specify a command to execute on the shell.')

    const outs = await new Promise((resolve, reject) => {
      const outs = []
      outs.push(`$ ${args.command}`)
      // timeout: 30 seconds
      exec(args.command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (stdout) outs.push(stdout)
        if (stderr) outs.push(stderr)
        if (error) outs.push(`Exit code: ${error.code}`)
        resolve(outs.map(out => stripAnsi(out)))
      })
    })

    await this.client.util.multiSend(message.channel, outs.join('\n'), {
      code: 'shell'
    })
    return message.delete()
  }
}

module.exports = ExecCommand
