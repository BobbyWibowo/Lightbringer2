const { ActivityTypes } = require('discord.js').Constants
const { ClientUtil } = require('discord-akairo')
const { Collection, Guild, Message, MessageEmbed, TextChannel } = require('discord.js')
const LightbringerError = require('./../util/LightbringerError')
const moment = require('moment')
const { resolveColor, escapeMarkdown, splitMessage } = require('discord.js').Util
const snekfetch = require('snekfetch')

class ExtendedClientUtil extends ClientUtil {
  constructor (client) {
    super(client)

    const {
      matchesListTimeout = 15000,
      maxMatchesListLength = 20
    } = client.akairoOptions

    this.matchesListTimeout = matchesListTimeout

    this.maxMatchesListLength = maxMatchesListLength
  }

  // Override parent functions.

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
      if (data.author && data.author.icon) {
        data.author.iconURL = data.author.icon
        delete data.author.icon
      }

      if (data.footer && data.footer.icon) {
        data.footer.iconURL = data.footer.icon
        delete data.footer.icon
      }
    }

    return new MessageEmbed(data)
  }

  resolveUsers (text, users, caseSensitive = false, wholeWord = false, tryExact = false, tryGlobalId = false) {
    if (tryGlobalId) {
      const get = this.client.users.get(text)
      if (get) return new Collection([[ get.id, get ]])
    }

    const loose = users.filter(user => this.checkUser(text, user, caseSensitive, wholeWord))
    if (tryExact && !(caseSensitive && wholeWord) && loose.size > 1) {
      const strict = loose.filter(user => this.checkUser(text, user, true, true))
      if (strict.size) return strict
    }

    return loose
  }

  resolveMembers (text, members, caseSensitive = false, wholeWord = false, tryExact = false) {
    const loose = members.filter(member => this.checkMember(text, member, caseSensitive, wholeWord))
    if (tryExact && !(caseSensitive && wholeWord) && loose.size > 1) {
      const exact = loose.filter(member => this.checkMember(text, member, true, true))
      if (exact.size) {
        return exact
      }
    }

    return loose
  }

  resolveChannels (text, channels, caseSensitive = false, wholeWord = false, tryExact = false, tryGlobalId = false) {
    if (tryGlobalId) {
      const get = this.client.channels.get(text)
      if (get) return new Collection([[ get.id, get ]])
    }

    const loose = channels.filter(channel => this.checkChannel(text, channel, caseSensitive, wholeWord))
    if (tryExact && !(caseSensitive && wholeWord) && loose.size > 1) {
      const exact = loose.filter(channel => this.checkChannel(text, channel, true, true))
      if (exact.size) {
        return exact
      }
    }

    return loose
  }

  resolveRoles (text, roles, caseSensitive = false, wholeWord = false, tryExact = false) {
    const loose = roles.filter(role => this.checkRole(text, role, caseSensitive, wholeWord))
    if (tryExact && !(caseSensitive && wholeWord) && loose.size > 1) {
      const exact = loose.filter(role => this.checkRole(text, role, true, true))
      if (exact.size) {
        return exact
      }
    }

    return loose
  }

  resolveGuilds (text, guilds, caseSensitive = false, wholeWord = false, tryExact = false, tryGlobalId = false) {
    if (tryGlobalId) {
      const get = this.client.guilds.get(text)
      if (get) return new Collection([[ get.id, get ]])
    }

    const loose = guilds.filter(guild => this.checkGuild(text, guild, caseSensitive, wholeWord))
    if (tryExact && !(caseSensitive && wholeWord) && loose.size > 1) {
      const exact = loose.filter(guild => this.checkGuild(text, guild, true, true))
      if (exact.size) {
        return exact
      }
    }

    return loose
  }

  // Extend with new functions.

  async sendStatus (message, options) {
    if (this.client._statusChannel && this.client._statusChannel instanceof TextChannel) {
      await this.client._statusChannel.send(message, options || {})
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

  async assertSingleItem (items, { name = 'matches', prop, syntax }, disableNotFound = false) {
    if (items.size === 1) {
      return items.first()
    } else if (items.size > 1) {
      throw new LightbringerError(this.formatMatchesList(items, { name, prop, syntax }), this.matchesListTimeout)
    } else if (!disableNotFound) {
      throw new LightbringerError(`Could not find any ${name} matching the keyword!`)
    }
  }

  async assertUser (keyword, source = this.client.users, fallbackToClient = false, disableNotFound = false) {
    // Return ClientUser.
    if (keyword === null && fallbackToClient) {
      return this.client.user
    }

    const resolved = this.resolveUsers(keyword, source, false, false, true, true)
    return this.assertSingleItem(resolved, {
      name: 'users',
      prop: 'tag',
      syntax: 'css'
    }, disableNotFound)
  }

  async assertMember (keyword, source, refreshStore = false, fallbackToClient = false, disableNotFound = false) {
    if (typeof source === 'string') {
      source = await this.assertGuild(source)
    }

    if (source instanceof Guild) {
      // Return GuildMember instance of the client.
      if (keyword === null && fallbackToClient) {
        return source.me
      }

      // Refresh GuildMemberStore.
      if (refreshStore) {
        await source.members.fetch()
      }

      source = source.members
    }

    const resolved = this.resolveMembers(keyword, source, false, false, true)
    return this.assertSingleItem(resolved, {
      name: 'members',
      prop: 'user.tag',
      syntax: 'css'
    }, disableNotFound)
  }

  async assertChannel (keyword, source = this.client.channels) {
    if (typeof source === 'string') {
      source = await this.assertGuild(source)
    }

    if (source instanceof Guild) {
      source = source.channels
    }

    const resolved = this.resolveChannels(keyword, source, false, false, true, true)
    return this.assertSingleItem(resolved, {
      name: 'channels',
      prop: 'name'
    })
  }

  async assertRole (keyword, source) {
    if (typeof source === 'string') {
      source = await this.assertGuild(source)
    }

    if (source instanceof Guild) {
      source = source.roles
    }

    const resolved = this.resolveRoles(keyword, source, false, false, true)
    return this.assertSingleItem(resolved, {
      name: 'roles',
      prop: 'name'
    })
  }

  async assertGuild (keyword, source = this.client.guilds) {
    const resolved = this.resolveGuilds(keyword, source, false, false, true, true)
    return this.assertSingleItem(resolved, {
      name: 'guilds',
      prop: 'name'
    })
  }

  async assertMemberOrUser (keyword, memberSource, refreshStore = false, userSource) {
    const result = {}

    if (memberSource) {
      const asserted = await this.assertMember(keyword, memberSource, refreshStore, true, true)
      if (asserted) {
        result.member = asserted
        result.user = asserted.user
      }
    }

    if (result.member === undefined) {
      // When userSource is missing, it will use default, which is this.client.users
      const asserted = await this.assertUser(keyword, userSource, true, true)
      if (asserted) result.user = asserted
    }

    if (result.user === undefined) {
      // This shall not ever be triggered as "this.assertUser" will
      // throw an Error when it can not find any matches.
      throw new LightbringerError('Could not find any members or users matching the keyword!')
    }

    return result
  }

  formatMatchesList (matches, { name = 'matches', prop, syntax = 'css' }) {
    if (typeof prop === 'string') {
      prop = [prop]
    }

    const size = matches.size

    let list = matches
      .map(match => {
        if (!prop) {
          return match
        }

        let value
        for (const p of prop) {
          value = this.getProp(match, p)
          if (value !== undefined) {
            break
          }
        }

        if (value) {
          return escapeMarkdown(value, true)
        } else {
          return 'undefined'
        }
      })
      .sort((a, b) => a.localeCompare(b))

    list.length = Math.min(this.maxMatchesListLength, size)

    if (size > this.maxMatchesListLength) {
      list.push(`and ${size - list.length} more \u2026`)
    }

    return `Multiple ${name} found, please be more specific:\n` +
      this.client.util.formatCode(list.join(', '), syntax)
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

  formatCode (text, lang, inline) {
    if (typeof lang !== 'string') {
      lang = ''
    }

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
        return `${timeMs.toFixed(1)}ms`
      } else {
        return `${timeMs.toFixed(3)}ms`
      }
    } else {
      return `${(timeNs / 1e9).toFixed(3)}s`
    }
  }

  capitalizeFirstLetter (input) {
    const sentences = input.split('. ')
    return sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ')
  }

  isKeywordMentionable (keyword, type) {
    // Role mention.
    if (type === 1) return /^<@&(\d{17,19})>$/.test(keyword)
    // Channel mention.
    if (type === 2) return /^<#(\d{17,19})>$/.test(keyword)
    // User/Member mention.
    return /^<@!?(\d{17,19})>$/.test(keyword)
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
    let {
      firstMessage = null,
      maxLength = 2000,
      code = null,
      char = '\n'
    } = options

    if (typeof code === 'string') {
      // 3 (```); code; 1 (\n); 1 (\n); 3 (```)
      maxLength -= 3 + code.length + 1 + 1 + 3
    }

    let messages = splitMessage(text, { maxLength, char })

    if (!(messages instanceof Array)) {
      messages = [messages]
    }

    if (typeof code === 'string') {
      messages = messages.map(s => this.formatCode(s, code))
    }

    return Promise.all(messages.map((m, i) => {
      if (firstMessage instanceof Message && i === 0) {
        return firstMessage.edit(m)
      } else {
        return channel.send(m)
      }
    }))
  }

  async multiSendEmbed (channel, data, options) {
    // ALERT: This function is extremely experimental.
    // There can be plenty of holes in its logic.
    const messages = []
    const description = data.description || '' // Long-ass description that needs to be properly split.

    let {
      firstMessage = null,
      content = null, // Content that will only be used for the first message.
      prefix = null, // Prefix that will only be prepended to the first embed.
      suffix = null, // Suffix that will only be appended to the last embed.
      maxLength = 2000,
      code = null,
      char = '\n'
    } = options

    if (typeof code === 'string') {
      // 3 (```); code; 1 (\n); 1 (\n); 3 (```)
      maxLength -= 3 + code.length + 1 + 1 + 3
    }

    let firstExtraLength = 0
    let lastExtraLength = 0

    // Calculate extra lengths.
    if (content) {
      firstExtraLength += content.length
    }

    if (prefix) {
      firstExtraLength += prefix.length
    }

    if (data.title) {
      firstExtraLength += data.title.length
    }

    if (typeof data.author === 'string') {
      firstExtraLength += data.author.length
    } else if (data.author !== undefined && data.author.name !== undefined) {
      firstExtraLength += data.author.name.length
    }

    if (suffix) {
      lastExtraLength += suffix.length
    }

    if (typeof data.footer === 'string') {
      lastExtraLength += data.footer.length
    } else if (data.footer !== undefined && data.footer.text !== undefined) {
      lastExtraLength += data.footer.text.length
    }

    const splitDescs = description.split(char)
    let tempDesc = ''

    const push = (desc, last) => {
      // ALERT: This function will ignore embed properties
      // other than "title", "author", "footer" and "color".
      const first = messages.length === 0

      const tempData = {
        color: data.color
      }

      if (typeof code === 'string') {
        desc = this.formatCode(desc, code)
      }

      if (first) {
        desc = (prefix || '') + desc
        tempData.title = data.title
        tempData.author = data.author
      }

      if (last) {
        desc = desc + (suffix || '')
        tempData.footer = data.footer
      }

      tempData.description = desc

      messages.push({
        content: first ? content : null,
        embed: this.embed(tempData)
      })

      /*
      console.log(`maxLength: ${maxLength}`)
      console.log(`content.length: ${content.length}`)
      console.log(`description.length: ${tempData.description.length}`)
      */
    }

    for (let i = 0; i < splitDescs.length; i++) {
      const isLast = i === splitDescs.length - 1

      let tempMaxLength = maxLength

      if (!messages.length) {
        tempMaxLength -= firstExtraLength
      } else if (isLast) {
        tempMaxLength -= lastExtraLength
      }

      if ((tempDesc.length + splitDescs[i].length + char.length) > tempMaxLength) {
        push(tempDesc)
        tempDesc = splitDescs[i] + char
      } else {
        tempDesc = tempDesc + splitDescs[i] + char // not using += for clarity
      }

      if (isLast) {
        push(tempDesc, isLast)
      }
    }

    return Promise.all(messages.map((m, i) => {
      if (firstMessage instanceof Message && i === 0) {
        return firstMessage.edit(m.content, { embed: m.embed })
      } else {
        return channel.send(m.content, { embed: m.embed })
      }
    }))
  }

  hexToRgb (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    if (result) {
      return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    } else {
      return null
    }
  }

  truncate (string, max, append = '') {
    if (!string || !max || (1 + append.length) >= max) {
      return ''
    }

    if (string.length <= max && !append) {
      return string
    }

    string = string.slice(0, max - 1 - append.length)
    if (/\s/.test(string.charAt(string.length - 1))) {
      string = string.replace(/\s+?$/, '')
    }
    return string + '\u2026' + append
  }
}

module.exports = ExtendedClientUtil
