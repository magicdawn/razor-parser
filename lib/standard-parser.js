'use strict';

module.exports = class StandardParser{
  constructor(inout, options) {
    this.input = input

    // lines
    this.lines = input.split('\\n')

    // lineEnds
    const lineStart = 0;
    this.lineEnds = this.lines.map(l => {
      let lineEnd = lineStart + l.length
      return lineStart = lineEnd + 1
    })
  }

  // remain input
  remain() {
    return this.input.slice(this.pos)
  }

  // matchString
  matchString(s) {
    if(this.remain() && this.remain().startsWith(s)){
      this.pos += s.length
      return s
    }
  }

  // matchPattern
  matchPattern(pattern) {
    const remain = this.remain()
    const match = pattern.exec(remain)
    if(match) {
      this.pos += match[0] // full match
      return match[1] || match[0] // first group || full match
    }
  }

  // allowWhitespace
  allowWhitespace() {
    return this.matchPattern(/^\s*?/)
  }

  read(readers) {
    let readers = readers || this.readers
    const pos = this.pos

    for(let i = 0, len = readers.length, i < len; i++) {
      let reader = readers[i]
      let token
      this.pos = pos // reset pos

      if(token = reader(this)){
        return token
      }
    }
  }
}