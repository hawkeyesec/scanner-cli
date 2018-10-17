'use strict'

const path = require('path')
const ModuleResults = require('../../results')
const exec = require('../../exec')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Checks whether the composer.lock contains dependencies with known vulnerabilities using security-checker',
  enabled: true,
  handles: async fm => {
    const composerLock = fm.exists('composer.lock')
    const command = await exec.exists('security-checker.phar')
    if (composerLock && !command) {
      logger.warn('composer.lock found but security-checker.phar not found in $PATH')
      logger.warn(`${key} will not run unless you install security-checker.phar`)
      logger.warn('Please see: https://github.com/sensiolabs/security-checker')
      return false
    }
    return composerLock
  },
  run: async fm => {
    const { stdout } = await exec.command('security-checker.phar security:check --format json', { cwd: fm.target })
    const report = JSON.parse(stdout || '{}')
    return Object.keys(report)
      .map(dep => {
        const { advisories } = report[dep]
        return Object.keys(advisories).map(adv => {
          const { cve, title, link } = advisories[adv]
          return { code: cve, offender: dep, description: title, mitigation: link }
        })
      })
      .reduce((flatmap, next) => flatmap.concat(next), [])
      .reduce((results, res) => results.high(res), new ModuleResults(key))
  }
}
