'use strict'
const path = require('path')
const util = require('../../util')
const async = require('async')
const defaultPatterns = require('./data')

module.exports = {
  key: 'files',
  name: 'Secret Files',
  description: 'Scans for known secret files',
  enabled: true,
  handles: () => true,
  run: ({ fm, results }, patterns = defaultPatterns) => new Promise(function (resolve, reject) {
    patterns.forEach(pattern => {
      pattern.matcher = makeMatcher(pattern)
      pattern.check = file => {
        const data = extractData(pattern.part, file)
        const result = pattern.matcher(data)
        if (result === true) {
          let message = pattern.caption
          const mitigation = util.defaultValue(pattern.description, 'Check contents of the file')
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

    const files = fm.all()
    async.each(files, (file, next) => {
      patterns.forEach(pattern => {
        pattern.check(file)
      })
      next()
    }, resolve)
  })
}

const makeExactMatcher = pattern => file => file === pattern.pattern
const makeRegexMatcher = pattern => file => pattern.pattern.exec(file) !== null
const makeMatcher = pattern => (pattern.type === 'regex') ? makeRegexMatcher(pattern) : makeExactMatcher(pattern)

const extractData = (part, file) => {
  const filename = path.basename(file)
  const extension = filename.split('.').pop()

  switch (part) {
    case 'filename':
      return filename
    case 'extension':
      return extension
    case 'path':
      return file
    default:
      console.log('Unknown part: ' + part)
  }
}
