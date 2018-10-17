'use strict'
const fs = require('fs')
const logger = require('../../logger')

module.exports = class JsonWriter {
  constructor ({ path }) {
    this.key = 'json'
    this.path = path
  }

  write (results, metadata, done) {
    fs.writeFileSync(this.path, JSON.stringify(results, null, 2))
    logger.log('json results saved to', this.path)
    done()
  }
}
