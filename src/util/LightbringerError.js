class LightbringerError extends Error {
  constructor (message, timeout = 8000) {
    super(message)

    this.timeout = timeout
  }
}

module.exports = LightbringerError
