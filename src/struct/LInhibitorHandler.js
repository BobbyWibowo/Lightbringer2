const { InhibitorHandler } = require('discord-akairo')

class LInhibitorHandler extends InhibitorHandler {
  load (thing, isReload) {
    const mod = super.load(thing, isReload)
    if (this.ready && isReload && mod && typeof mod.onReady === 'function') { mod.onReady() }
    return mod
  }

  reload (id) {
    const mod = this.modules.get(id.toString())
    if (mod && typeof mod.onReload === 'function') { mod.onReload() }
    return super.reload(id)
  }

  remove (id) {
    const mod = this.modules.get(id.toString())
    if (mod && typeof mod.onRemove === 'function') { mod.onRemove() }
    return super.remove(id)
  }

  readyAll () {
    this.ready = true
    this.modules.forEach(mod => {
      if (typeof mod.onReady === 'function') { mod.onReady() }
    })
  }
}

module.exports = LInhibitorHandler
