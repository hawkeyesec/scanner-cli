'use strict'

const glob = require('glob')
const path = require('path')

module.exports = () => glob.sync(path.join(__dirname, '*', 'index.js')).map(require)
