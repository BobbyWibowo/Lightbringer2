class LightbringerError extends Error {
  constructor (message, timeout) {
    super(message)

    this.timeout = timeout
  }
}

module.exports = LightbringerError
