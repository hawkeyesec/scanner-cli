'use strict'
const fs = require('fs')
const logger = require('../../logger')

module.exports = function JsonWriter ({ path }) {
  const self = {
    key: 'json'
  }
  self.write = function (results, metadata, done) {
    fs.writeFileSync(path, JSON.stringify(results, null, 2))
    logger.log('json results saved to', path)
    done()
  }
  return Object.freeze(self)
}
