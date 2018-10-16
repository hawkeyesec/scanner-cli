'use strict'

const ModuleResults = require('../../results')
const patterns = require('./data')

const key = 'contents'
module.exports = {
  key,
  name: 'File Contents',
  description: 'Scans files for dangerous content',
  enabled: true,
  handles: async () => true,
  run: async fm => fm.languageFiles
    .map(file => ({ file, content: fm.readFileSync(file) }))
    .map(({ file, content }) => patterns.map(pattern => checkFileWithPattern(pattern, file, content)))
    .reduce((flatmap, next) => flatmap.concat(next), [])
    .filter(result => !!result)
    .reduce((results, res) => results[res.level](res), new ModuleResults(key))
}

const checkFileWithPattern = ({ code, level, description, regex }, file, content) => {
  const result = regex.exec(content)
  if (!result) return

  const line = content.split(result[0])[0].split('\n').length
  return { code, offender: file, description, level, mitigation: `Check line number: ${line}` }
}
