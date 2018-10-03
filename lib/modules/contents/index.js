'use strict'

const async = require('async')
const patterns = require('./data')

module.exports = {
  key: 'contents',
  name: 'File Contents',
  description: 'Scans files for dangerous content',
  enabled: true,
  handles: () => true,
  run: ({ fm, results }) => new Promise(function (resolve, reject) {
    (function buildPatternChecks () {
      patterns.forEach(pattern => {
        pattern.contentMatcher = makeContentMatcher(pattern.content)
        pattern.check = (file, content) => {
          const result = pattern.contentMatcher(content)
          if (result.isMatch === true) {
            const message = pattern.caption
            const mitigation = 'Check line number: ' + result.line
            const item = {
              code: pattern.code,
              offender: file,
              description: message,
              mitigation: mitigation
            }
            results[pattern.level](item)
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

const makeContentMatcher = pattern => {
  return item => {
    const rx = pattern.exec(item)
    const result = (rx !== null)
    let line = 0
    if (result === true) {
      line = item.split(rx[0])[0].split('\n').length
    }
    return {
      isMatch: result,
      line: line
    }
  }
}
