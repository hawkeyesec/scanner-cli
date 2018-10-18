'use strict'

const superagent = require('superagent')

const key = 'writer-sumo'

/**
 *
 * @param {Array} moduleResults Data that should be written to sumologic
 * @param {Object} metadata Specific information needed by this writer
 * @param {String} metadata.url The collector's url
 * @param {String} metadata.host The sumo host
 * @returns {Promise} Resolves when everything was be posted, throws otherwise
 */
const write = (moduleResults, metadata) => moduleResults
  .reduce((promise, result) => promise.then(() => superagent
    .post(metadata.url)
    .send(result)
    .set('User-Agent', 'hawkeye')
    .set('X-Sumo-Name', 'hawkeye')
    .set('X-Sumo-Category', result.module)
    .set('X-Sumo-Host', metadata.host || 'unknown')), Promise.resolve())

module.exports = {
  key,
  write
}
