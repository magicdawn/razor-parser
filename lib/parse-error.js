'use strict'

module.exports = class ParseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ParseError'
  }
}