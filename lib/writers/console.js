'use strict'

require('console.table')

const key = 'writer-console'

/**
 * @param {Array} results Data that should be written to the console
 * @returns {Promise} Resolves when everything was written
 */
const write = async results => console.table(results)

module.exports = {
  key,
  write
}
