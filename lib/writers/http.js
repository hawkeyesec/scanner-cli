'use strict'

const superagent = require('superagent')

const key = 'writer-http'

/**
 *
 * @param {Array} results Data that should be written to sumologic
 * @param {Object} metadata Specific information needed by this writer
 * @param {String} metadata.url The collector's url
 * @returns {Promise} Resolves when everything was be posted, throws otherwise
 */
const write = (results, metadata) => results
  .reduce((promise, result) => promise.then(() => superagent
    .post(metadata.url)
    .send(result)
    .set('User-Agent', 'hawkeye')), Promise.resolve())

module.exports = {
  key,
  write
}
