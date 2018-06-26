const { Command } = require('discord-akairo')

class MarkAsReadCommand extends Command {
  constructor () {
    super('markasread', {
      aliases: ['markasread', 'mar'],
      description: 'Deletes a certain number of messages sent by bots.',
      args: [
        {
          id: 'all',
          match: 'flag',
          flag: ['--all', '-a'],
          description: 'Mark all unmuted guilds as read.'
        },
        {
          id: 'muted',
          match: 'flag',
          flag: ['--muted', '-m'],
          description: 'If using "--all", include muted guilds.'
        },
        {
          id: 'keyword',
          match: 'rest',
          description: 'The guild that you would want to be marked as read.'
        }
      ],
      options: {
        usage: 'markasread [ --all [--muted] | keyword ]'
      }
    })
  }

  async exec (message, args) {
    if (args.all) {
      let acknowledged = 0
      await message.status('progress', 'Marking all guilds as read\u2026')
      const guilds = this.client.guilds
        .filter(g => args.muted ? true : !g.muted)
      await Promise.all(guilds.map(g => {
        return g.acknowledge()
          .then(() => acknowledged++)
          .catch(() => {})
      }))
      return message.status('success', `Successfully marked \`${acknowledged}\` guild(s) as read.`)
    }

    let target
    if (args.keyword) {
      const resolved = this.client.util.resolveGuilds(args.keyword, this.client.guilds)
      if (resolved.size === 1) {
        target = resolved.first()
      } else if (resolved.size > 1) {
        return message.status('error',
          this.client.util.formatMatchesList(resolved, {
            name: 'guilds',
            prop: 'name'
          }),
          this.client.util.matchesListTimeout
        )
      } else {
        return message.status('error', 'Could not find any matching guilds.')
      }
    } else {
      if (!message.guild) {
        return message.status('error', 'You must be in a guild to run this command without parameter.')
      }
      target = message.guild
    }

    await target.acknowledge()
    await message.status('success', `Successfully marked guild \`${target.name}\` as read.`)
  }
}

module.exports = MarkAsReadCommand
