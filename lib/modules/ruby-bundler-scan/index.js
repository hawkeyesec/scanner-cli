'use strict'

const path = require('path')
const ModuleResults = require('../../results')
const exec = require('../../exec')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scan for Ruby gems with known vulnerabilities using bundler',
  enabled: true,
  handles: async fm => {
    const isRubyProject = fm.exists('Gemfile.lock')
    const hasCommand = await exec.exists('bundle-audit')

    if (isRubyProject && !hasCommand) {
      logger.warn('Gemfile.lock found but bundle-audit not found in $PATH')
      logger.warn(`${key} will not run unless you install bundle-audit`)
      logger.warn('Please see: https://github.com/rubysec/bundler-audit')
      return false
    }
    return isRubyProject
  },
  run: async fm => {
    logger.log('Updating bundler-audit database...')
    await exec.command('bundle-audit update')
    const { stdout } = await exec.command('bundle-audit', { cwd: fm.target })
    const regex = {
      name: /Name: /,
      title: /Title: /,
      criticality: /Criticality: /,
      extraInfo: /Solution: /,
      code: /Advisory: /,
      url: /URL: /
    }
    const insecureSourceMessage = 'Insecure Source URI'

    const results = new ModuleResults(key)
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
        ;(results[criticality] || results.low).bind(results)(item)
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

    return results
  }
}
