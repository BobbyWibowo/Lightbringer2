class Stats {
  constructor (client) {
    this.client = client
    this.data = {}
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    if (value === undefined) {
      delete this.data[key]
    } else {
      this.data[key] = value
    }
  }

  increment (key, amount) {
    this.set(key, (this.get(key) || 0) + (amount || 1))
  }
}

module.exports = Stats
