const { ActivityTypes } = require('discord.js').Constants
const { ClientUtil } = require('discord-akairo')
const { MessageEmbed, TextChannel } = require('discord.js')
const moment = require('moment')
const { resolveColor, escapeMarkdown, splitMessage } = require('discord.js').Util
const snekfetch = require('snekfetch')

const R_USER = /^<@!?(\d+?)>$/
const R_ROLE = /^<@&?(\d+?)>$/
const R_CHANNEL = /^<#(\d+?)>$/

const MAX_MATCHES_LENGTH = 20

class ExtendedClientUtil extends ClientUtil {
  constructor (client) {
    super(client)

    const {
      matchesListTimeout = 15000 // default
    } = client.akairoOptions

    this.matchesListTimeout = matchesListTimeout
  }

  async sendStatus (message, options) {
    if (this.client.statusChannel && this.client.statusChannel instanceof TextChannel) {
      await this.client.statusChannel.send(message, options || {})
    }
  }

  async snek (url, options) {
    // Since this will return the finished Promise, any snek's
    // functions which could have been used to alter the options,
    // such as.set(), etc. will not be usable on the returned value.
    // Thus make sure to get used to using SnekfetchOptions when
    // using snekfetch with this function.
    return snekfetch
      .get(url, options)
      .catch(error => {
        // On some failures such as 403 Forbidden, snekfetch will throw an Error
        // instead of returning things with 403 on its 'status' property, so
        // instead catch it and format it like below to less complicate things
        // when using snekfetch anywhere else (meaning there's no need for
        // .catch() but instead simply make sure the 'status' property is 200).
        console.error(error)
        return {
          status: -1,
          text: error.toString()
        }
      })
  }

  embed (data) {
    // If data Object exists, attempt
    // to apply some extended behavior.
    if (data) {
      // Resolve ColorResolvable to number.
      if (data.color !== undefined) {
        data.color = resolveColor(data.color)
      }

      // Apply default 'inline' property if available
      // onto fields that do NOT yet have them.
      if (data.inline !== undefined) {
        if (data.fields !== undefined) {
          for (let i = 0; i < data.fields.length; i++) {
            if (data.fields[i].inline === undefined) {
              data.fields[i].inline = data.inline
            }
          }
          delete data.inline
        }
      }

      // String data to its proper Object equivalent.
      if (typeof data.author === 'string') {
        data.author = { name: data.author }
      }

      if (typeof data.footer === 'string') {
        data.footer = { text: data.footer }
      }

      if (typeof data.image === 'string') {
        data.image = { url: data.image }
      }

      if (typeof data.thumbnail === 'string') {
        data.thumbnail = { url: data.thumbnail }
      }

      // Move 'icon' property to 'iconURL' property since
      // 'icon' will often be used as a shortcut to 'iconURL'.
      if (data.author !== undefined && data.author.icon !== undefined) {
        data.author.iconURL = data.author.icon
        delete data.author.icon
      }

      if (data.footer !== undefined && data.footer.icon !== undefined) {
        data.footer.iconURL = data.footer.icon
        delete data.footer.icon
      }
    }

    return new MessageEmbed(data)
  }

  resolveMemberOrUser (keyword, memberSource, userSource = this.client.users) {
    // TODO: Probably make formatMatchesList() a part of this function.
    const result = {
      member: undefined,
      user: undefined,
      failed: undefined
    }

    if (!keyword) {
      return result
    }

    // First of all, try to get GuildMembers matching the keyword.
    if (memberSource) {
      const resolved = this.resolveMembers(keyword, memberSource)
      if (resolved.size > 1) {
        // Return the entire Collection when there are more than 1 result.
        // This is so that it can be then sent to formatMatchesList().
        result.member = resolved
      } else if (resolved.size === 1) {
        // Return the result when there is exactly 1 result.
        result.member = resolved.first()
        result.user = result.member.user
      }
    }

    // If no GuildMember could be found, try to get User matching the keyword instead.
    if (!result.member && userSource) {
      const resolved = this.resolveUsers(keyword, userSource)
      if (resolved.size > 1) {
        // Return the entire Collection. Same reason as the
        // one for resolving GuildMembers.
        result.user = resolved
      } else if (resolved.size === 1) {
        result.user = resolved.first()
      }
    }

    if (result.member === undefined && result.user === undefined) {
      // An indicator of complete failure.
      result.failed = true
    }

    return result
  }

  formatMatchesList (matches, options = { name: 'matches' }) {
    if (typeof options.prop === 'string') {
      options.prop = [options.prop]
    }

    const size = matches.size

    let list = matches
      .map(match => {
        if (!options.prop) return match
        let value
        for (const prop of options.prop) {
          if (value !== undefined) break
          value = this.getProp(match, prop)
        }
        return value ? escapeMarkdown(value, true) : 'undefined'
      })
      .sort((a, b) => a.localeCompare(b))

    list.length = Math.min(MAX_MATCHES_LENGTH, size)

    if (size > MAX_MATCHES_LENGTH) {
      list.push(`and ${size - list.length} more \u2026`)
    }

    return `Multiple ${options.name} found, please be more specific:\n` +
      this.client.util.formatCode(list.join(', '), 'css')
  }

  hasPermissions (channel, permissions) {
    // NOTICE: Not to be used when checking certain permissions
    // like MANAGE_MESSAGES. This function was made to be primarily
    // used to check EMBED_LINKS permission since it's bound
    // to be always available in DMChannel and GroupDMChannel.
    if (!(channel instanceof TextChannel)) {
      return true
    }

    return channel.permissionsFor(channel.guild.me).has(permissions)
  }

  getProp (object, props) {
    if (!object || !props) return

    if (typeof props === 'string') {
      if (props.includes('.')) {
        const propsArr = props.split('.')
        props = []

        for (let i = 0; i < propsArr.length; i++) {
          let p = propsArr[i]

          while (p[p.length - 1] === '\\' && propsArr[i + 1] !== undefined) {
            p = p.slice(0, -1) + '.'
            p += propsArr[++i]
          }

          props.push(p)
        }
      } else {
        props = [props]
      }
    } else if (!(props instanceof Array)) {
      return object
    }

    for (let i = 0; i < props.length; i++) {
      object = object[props[i]]

      if (object === undefined) {
        break
      }
    }

    return object
  }

  humanizeDuration (ms, maxUnits, short, fraction = true) {
    const round = ms > 0 ? Math.floor : Math.ceil
    const parsed = [
      {
        name: 'week',
        int: round(ms / 604800000)
      },
      {
        name: 'day',
        int: round(ms / 86400000) % 7
      },
      {
        name: 'hour',
        int: round(ms / 3600000) % 24
      },
      {
        name: 'minute',
        int: round(ms / 60000) % 60
      },
      {
        name: 'second',
        int: (round(ms / 1000) % 60) + (round(ms) % 1000 / 1000)
      }
    ]

    const result = []
    for (let i = 0; i < parsed.length; i++) {
      if (!result.length && parsed[i].int === 0) {
        continue
      }

      if (result.length >= maxUnits) {
        break
      }

      let int = parsed[i].int
      if (!result.length && fraction && i === parsed.length - 1) {
        int = int.toFixed(1)
      } else {
        int = int.toFixed(0)
      }

      let substring = int + ' '
      if (short) {
        substring += parsed[i].name.charAt(0)
      } else {
        substring += parsed[i].name
        if (parseFloat(int) !== 1) substring += 's'
      }

      result.push(substring)
    }

    return result.map((res, i) => {
      if (!short) {
        if (i === result.length - 2) {
          return res + ' and'
        } else if (i !== result.length - 1) {
          return res + ','
        }
      }
      return res
    }).join(' ')
  }

  fromNow (date) {
    if (!date) return false

    const ms = new Date().getTime() - date.getTime()

    if (ms >= 86400000) {
      const days = Math.floor(ms / 86400000)
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }

    return `${this.humanizeDuration(ms, 1, false, false)} ago`
  }

  formatFromNow (date) {
    return `${moment(date).format('ddd, MMM Do YYYY @ h:mm:ss a')} (${this.fromNow(date)})`
  }

  formatCode (text, lang = '', inline) {
    if (inline) {
      return '`' + text + '`'
    } else {
      return '```' + lang + '\n' + text + '\n' + '```'
    }
  }

  formatTimeNs (timeNs) {
    if (timeNs < 1e9) {
      const timeMs = timeNs / 1e6
      if (timeMs >= 100) {
        return `${timeMs.toFixed(1)} ms`
      } else {
        return `${timeMs.toFixed(3)} ms`
      }
    } else {
      return `${(timeNs / 1e9).toFixed(3)} s`
    }
  }

  capitalizeFirstLetter (input) {
    const sentences = input.split('. ')
    return sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ')
  }

  isKeywordMentionable (keyword, type) {
    if (type === 1) return R_ROLE.test(keyword)
    if (type === 2) return R_CHANNEL.test(keyword)
    return R_USER.test(keyword)
  }

  formatYesNo (isYes) {
    return isYes ? 'yes' : 'no'
  }

  getHostName (url) {
    const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
    return match ? match[2] : ''
  }

  formatActivityType (type, lower) {
    if (typeof type !== 'string') {
      type = ActivityTypes[type]
    }

    type = lower ? type.toLowerCase() : type.charAt(0) + type.slice(1).toLowerCase()

    if (/^listening$/i.test(type)) {
      type += ' to'
    }

    return type
  }

  pad (padding, string, paddingLeft) {
    if (string === undefined) {
      return padding
    }

    if (paddingLeft) {
      return (padding + string).slice(-padding.length)
    } else {
      return (string + padding).substring(0, padding.length)
    }
  }

  async multiSend (channel, text, options) {
    let maxLength = options.maxLength || 2000

    if (options.code) {
      // 3 (```); options.code; 1 (\n); 1 (\n); 3 (```)
      maxLength -= 3 + options.code.length + 1 + 1 + 3
    }

    let split = splitMessage(text, {
      maxLength,
      char: options.char || '\n'
    })

    if (!(split instanceof Array)) {
      split = [split]
    }

    if (options.code) {
      split = split.map(s => this.formatCode(s, options.code))
    }

    return Promise.all(split.map(s => channel.send(s)))
  }
}

module.exports = ExtendedClientUtil
