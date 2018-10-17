'use strict'
const requestAsync = require('request')
const { promisify } = require('util')
const request = promisify(requestAsync)

const PivotResult = function (module, level, results) {
  return results.map(result => {
    return {
      level: level,
      module: module.key,
      description: result.description,
      offender: result.offender,
      extra: result.extra || ''
    }
  })
}

module.exports = class SumoLogic {
  constructor ({ url }) {
    this.key = 'sumologic'
  }

  write (results, metadata, done) {
    /* results are passed by module, so we need to pivot */
    let pivot = []
    results.forEach(module => {
      Object.keys(module.results).forEach(level => {
        let results = module.results[level]
        pivot.push(...new PivotResult(module.module, level, results))
      })
    })

    const levels = {
      critical: 8,
      high: 4,
      medium: 2,
      low: 1
    }
    pivot = pivot.sort((a, b) => {
      return levels[a.level] - levels[b.level]
    }).reverse()

    pivot.reduce((requests, result) => requests.then(() => request.post({
      url: this.url,
      json: true,
      headers: {
        'User-Agent': 'hawkeye',
        'X-Sumo-Name': 'hawkeye',
        'X-Sumo-Category': result.module,
        'X-Sumo-Host': process.env.HOSTNAME || 'unknown'
      },
      body: result
    }).then(({ statusCode }) => {
      if (result.statusCode !== 200) {
        throw new Error('Failed to send to sumologic, status: ' + result.statusCode)
      }
    })), Promise.resolve())
  }
}
