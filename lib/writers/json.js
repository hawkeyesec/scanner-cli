'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const key = 'writer-json'

/**
 *
 * @param {Object|Array} payload Data that should be written to disk
 * @param {Object} metadata Specific information needed by this writer
 * @param {String} metadata.file Which file to write to
 */
const write = (payload = {}, metadata) => promisify(writeFile)(metadata.file, JSON.stringify(payload))

module.exports = {
  key,
  write
}
