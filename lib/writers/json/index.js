'use strict'
const fs = require('fs')

module.exports = class JsonWriter {
  constructor ({ path }) {
    this.key = 'json'
    this.path = path
  }

  write (results, metadata, done) {
    fs.writeFileSync(this.path, JSON.stringify(results, null, 2))
    done()
  }
}
