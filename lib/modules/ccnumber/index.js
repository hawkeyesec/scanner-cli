'use strict'

const async = require('async')
const luhn = require('./luhn')
const patterns = require('./data')

module.exports = {
  key: 'ccnumber',
  name: 'Credit Card Numbers',
  description: 'Scans files for potential credit card numbers',
  enabled: true,
  handles: () => true,
  run: ({ fm, results }) => new Promise(function (resolve, reject) {
    (function buildPatternChecks () {
      patterns.forEach(pattern => {
        pattern.contentMatcher = makeContentMatcher(pattern.content)
        pattern.check = (file, content) => {
          const result = pattern.contentMatcher(content)
          if (result.isMatch === true) {
            results.high({
              code: pattern.code,
              offender: file,
              description: pattern.caption,
              mitigation: 'Check line number: ' + result.line
            })
          }
        }
      })
    })()

    ;(function executeChecksAgainstFiles () {
      const checkPatternAgainstFiles = (pattern, nextPattern) => {
        const checkPatternAgainstLanguageFile = (file, nextFile) => {
          const validateFileContents = (err, contents) => {
            if (err) { return nextFile() }
            pattern.check(file, contents)
            async.setImmediate(nextFile)
          }
          fm.readFile(file, validateFileContents)
        }
        async.eachSeries(fm.languageFiles, checkPatternAgainstLanguageFile, nextPattern)
      }
      async.eachSeries(patterns, checkPatternAgainstFiles, resolve)
    })()
  })
}

const makeContentMatcher = pattern => item => {
  let result = null
  let line = 0
  if (item.length < 400) {
    // Make sure we strip out all instances of " " or "-" and isolate potential CC number
    const isolatedItem = item.replace(/(\d+)([ -])(\d+)/g, '$1$3')
      .replace(/(\d+)([ -])(\d+)/g, '$1$3')
      .replace(/(\d+)([ -])(\d+)/g, '$1$3')
      .replace(/(\D)(\d{15,})/g, '$1 $2')
      .replace(/(\d{15,})(\D)/g, '$1 $2')

    const rx = pattern.exec(isolatedItem)
    result = null
    if (rx !== null) {
      const nums = rx.toString().split(/[\D]/)
      nums.forEach(function (value) {
        result = luhn.validate(value)
      })
    }
    line = 0
    if (result === true) {
      line = item.split(rx[0])[0].split('\n').length
    }
  }
  return {
    isMatch: result,
    line: line
  }
}
