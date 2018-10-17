'use strict'

/* eslint-disable no-cond-assign */

const path = require('path')
const ModuleResults = require('../../results')

const description = 'High entropy string detected in file'
const key = __dirname.split(path.sep).pop()

module.exports = {
  key,
  description: 'Scans files for strings with high entropy that are likely to contain passwords',
  enabled: false,
  handles: () => true,
  run: async fm => fm.languageFiles
    .map(file => ({ file, content: fm.readFileSync(file) }))
    .map(({ file, content }) => {
      const re = /\w{10,}/g
      let m
      while (m = re.exec(content)) {
        if (shannon(m[0]) > 4.5) {
          const line = content.split(m[0])[0].split('\n').length
          return { code: `${file}-${line}`, offender: file, description, mitigation: `Check line number: ${line}` }
        }
      }
    })
    .filter(result => !!result)
    .reduce((results, res) => results.low(res), new ModuleResults(key))
}

// https://gist.github.com/ppseprus/afab8500dec6394c401734cb6922d220
const shannon = str => [...new Set(str)]
  .map(chr => str.match(new RegExp(chr, 'g')).length)
  .reduce((sum, frequency) => {
    let p = frequency / str.length
    return sum + p * Math.log2(1 / p)
  }, 0)
