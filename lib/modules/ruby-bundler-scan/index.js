'use strict'

const util = require('../../util')

const key = 'ruby-bundler-scan'
module.exports = {
  key,
  name: 'Bundler Scan',
  description: 'Scan for Ruby gems with known vulnerabilities',
  enabled: true,
  handles: ({ fm, exec, logger }) => {
    const isRubyProject = fm.exists('Gemfile.lock')

    if (isRubyProject && !exec.commandExists('bundle-audit')) {
      logger.warn('Gemfile.lock found but bundle-audit not found in $PATH')
      logger.warn(`${key} will not run unless you install bundle-audit`)
      logger.warn('Please see: https://github.com/rubysec/bundler-audit')
      return false
    }
    return isRubyProject
  },
  run: ({ fm, exec, results, logger }) => new Promise(function (resolve, reject) {
    logger.log('Updating bundler-audit database...')
    exec.command('bundle-audit update', null, err => {
      if (!util.isEmpty(err)) {
        logger.warn('Failed to update bundle-audit database.')
        logger.warn('You may be scanning with out of date definitions')
      }
      exec.command('bundle-audit', { cwd: fm.target }, (err, { stdout = '' }) => {
        if (!util.isEmpty(err)) {
          return reject(err)
        }

        const regex = {
          name: /Name: /,
          title: /Title: /,
          criticality: /Criticality: /,
          extraInfo: /Solution: /,
          code: /Advisory: /,
          url: /URL: /
        }
        const insecureSourceMessage = 'Insecure Source URI'

        const lines = stdout.split('\n')
        let vulnerability = {}
        lines.forEach(line => {
          for (const key of Object.keys(regex)) {
            const matchingLine = line.match(regex[key])
            if (matchingLine) {
              vulnerability[key] = line.split(matchingLine)[1]
            }
          }

          if (Object.keys(vulnerability).length === 6) {
            const criticality = vulnerability.criticality.toLowerCase()
            const item = {
              code: vulnerability.code.toLowerCase(),
              offender: vulnerability.name,
              description: vulnerability.title,
              mitigation: vulnerability.url
            }
            ;(results[criticality] || results.low)(item)
            vulnerability = {}
          }

          if (line.indexOf(insecureSourceMessage) > -1) {
            const item = {
              code: 1,
              offender: 'Gemfile',
              description: 'Insecure Source URI',
              mitigation: 'Use a https:// gem source'
            }

            results.low(item)
          }
        })

        resolve()
      })
    })
  })
}
