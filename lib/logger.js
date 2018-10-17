'use strict'

const colors = require('colors')

const notTest = process.env.NODE_ENV !== 'testing'

module.exports = {
  log: (...args) => notTest && console.log('[info]', ...args),
  warn: (...args) => notTest && console.log('[warn]', colors.yellow(...args)),
  error: (...args) => notTest && console.error('[error]', colors.red(...args))
}
