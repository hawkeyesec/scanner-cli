'use strict'
const glob = require('glob')
const path = require('path')
require('colors')

module.exports = () => glob.sync(path.join(__dirname, 'modules/**/index.js'))
  .map(require)
