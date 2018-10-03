'use strict'
const async = require('async')
const shannon = require('./shannon')

module.exports = {
  key: 'entropy',
  name: 'Entropy',
  description: 'Scans files for strings with high entropy',
  enabled: false,
  handles: () => true,
  run: ({ fm, results }) => new Promise(function (resolve, reject) {
    const checkEntropy = (file, contents, nextFile) => {
      const re = /\w{10,}/g
      let m

      do {
        m = re.exec(contents)
        if (m) {
          const word = m[0]
          const entropy = shannon(word)
          if (entropy > 4.5) {
            const line = contents.split(m[0])[0].split('\n').length
            results.low({
              code: '1',
              offender: file,
              description: 'High entropy string detected in file',
              mitigation: 'Check line number: ' + line
            })
          }
        }
      } while (m)
      async.setImmediate(nextFile)
    };

    (function executeChecksAgainstFiles () {
      async.eachSeries(fm.languageFiles, (file, nextFile) => {
        fm.readFile(file, (err, contents) => {
          if (err) { return nextFile() }
          checkEntropy(file, contents, nextFile)
        })
      }, resolve)
    })()
  })
}
