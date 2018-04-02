class Stats {
  constructor (client) {
    Object.defineProperties(this, {
      client: {
        value: client
      }
    })

    this._stats = {}
  }

  get (key) {
    return this._stats[key]
  }

  set (key, value) {
    if (value === undefined) {
      delete this._stats[key]
    } else {
      this._stats[key] = value
    }
  }

  increment (key, amount) {
    this.set(key, (this.get(key) || 0) + (amount || 1))
  }
}

module.exports = Stats
