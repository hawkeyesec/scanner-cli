
const _ = require('lodash')

const threshold = { low: 1, medium: 2, high: 3, critical: 4 }

function flatMap (accumulator, chunk) {
  return accumulator.concat(chunk)
}

/**
 * @typedef ScanResult
 * @type {Object}
 * @property {String} module
 * @property {String} level
 * @property {String} code
 * @property {String} offender
 * @property {String} description
 * @property {String} mitigation
 */

class ScanResults {
  /**
   * @param {Array} results
   */
  constructor (results) {
    this.results = results
  }

  /**
   * @param {ModuleResult[]} moduleResultList
   * @return {ScanResults}
   */
  static fromModuleResultsList (moduleResultList) {
    const results = moduleResultList
      .map(({ key, data }) => {
        const result = []
        for (const level in threshold) {
          data[level].forEach(item => {
            const filteredItem = _.pick(item, ['code', 'offender', 'description', 'mitigation'])
            result.push({ module: key, level, ...filteredItem })
          })
        }
        return result
      })
      .reduce(flatMap, [])

    return new ScanResults(results)
  }

  /**
   * @param {string} level
   * @return {ScanResult[]}
   */
  allWithLevelAtLeast (level) {
    return this.results.filter(r => {
      return threshold[r.level] >= threshold[level]
    })
  }
}

module.exports = { ScanResults }
