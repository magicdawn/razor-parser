'use strict'

/**
 * consts
 */

const SPACE = ' '
const LEADING_SPACE_PATTERN = /^\s*?/

/**
 * module dependencies
 */

const readTemplate = require('./readers/readTemplate')
const ParseError = require('./parse-error')
const _ = require('lodash')
const repeat = require('lodash/string/repeat')

module.exports = class StandardParser {
  constructor(input, options) {
    this.input = input.replace(/\\r\\n/, '\n')

    // lines
    let lineStart = 0
    let lines = this.input.split('\\n')
    this.lineStarts = lines.map((line, index) => {
      const ret = lineStart
      lineStart += line.length + 1
      return ret
    })

    // default pos
    this.pos = 0

    // default readers
    this.readers = [readTemplate]

    // tokens
    this.tokens = []
    let token
    while (this.pos < this.input.length && (token = this.read())) {
      this.tokens.push(token)
    }
  }

  // remain input
  remain() {
    return this.input.slice(this.pos)
  }

  // matchString
  matchString(s) {
    if (this.remain() && this.remain().startsWith(s)) {
      this.pos += s.length
      return s
    }
  }

  // matchPattern
  matchPattern(pattern) {
    const remain = this.remain()
    const match = pattern.exec(remain)
    if (match) {
      this.pos += match[0].length // full match
      return match[1] || match[0] // first group || full match
    }
  }

  // allowWhitespace
  allowWhitespace() {
    return this.matchPattern(LEADING_SPACE_PATTERN)
  }

  read(readers) {
    readers = readers || this.readers
    const pos = this.pos

    for (let i = 0, len = readers.length; i < len; i++) {
      this.pos = pos // reset pos
      let reader = readers[i]
      let token

      if (token = reader(this)) {
        return token
      }
    }
  }

  /**
   * get zero based location
   */
  getPosition(pos) {
    pos = pos || this.pos
    let line = 0
    let col = 0

    while (pos >= this.lineStarts[line]) {
      line++
    }

    line -= 1
    col = pos - this.lineStarts[line]

    return [line, col]
  }

  error(msg) {
    const pos = this.getPosition()
    const line = pos[0] + 1 // 1 based
    const col = pos[1] + 1 // 1 based

    let tabNum = 0
    let content = this.lines[line - 1]
    let annotation = content.replace(/\t/, (match, index) => {
      if (index < this.pos) {
        tabNum++
      }
      return repeat(SPACE, 2)
    }) + '\n' + repeat(SPACE, pos[1] + tabNum) + '^----'

    let err = new ParseError(`${ msg } at line ${ line } column ${ col }:\n${ annotation }`)
    err.pos = pos
    err.line = pos[0]
    err.col = pos[1]
    err.shortMessage = msg

    throw err
  }
}