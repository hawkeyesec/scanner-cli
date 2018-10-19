'use strict'

const path = require('path')
const items = require('./data')
const ModuleResults = require('../../results')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scans for suspicious filenames that are likely to contain secrets',
  enabled: true,
  handles: () => true,
  run: fm => {
    const results = new ModuleResults(key)

    const checkers = items.map(item => {
      const matcher = (item.type === 'regex') ? makeRegexMatcher(item.pattern) : makeExactMatcher(item.pattern)
      return file => {
        const data = extractData(item.part, file)
        if (matcher(data)) {
          results[item.level]({
            code: `${file}-${item.code}`,
            offender: file,
            description: item.caption,
            mitigation: item.description || 'Check contents of the file'
          })
        }
      }
    })

    fm.all().forEach(file => checkers.forEach(checker => checker(file)))

    return results
  }
}

const makeExactMatcher = pattern => file => file === pattern
const makeRegexMatcher = pattern => file => !!pattern.exec(file)

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
      return ''
  }
}
