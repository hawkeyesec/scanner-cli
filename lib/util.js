'use strict'
const fs = require('fs')
const istext = require('istextorbinary')
require('colors')

module.exports = {
  isEmpty: function (value) {
    return (value === undefined || value === null)
  },
  readFileSync: function (absolute) {
    const stat = fs.statSync(absolute)
    if (stat.size > 1000000) {
      console.warn(('[warn] File which exceeds 1MB limited detected: ' + absolute).yellow)
      return ''
    }
    const buffer = fs.readFileSync(absolute)
    if (!istext.isTextSync(absolute, buffer)) {
      console.warn(('[warn] Binary file detected when expected text: ' + absolute).yellow)
      return ''
    }
    const contents = buffer.toString().trim()
    return contents
  }
}
