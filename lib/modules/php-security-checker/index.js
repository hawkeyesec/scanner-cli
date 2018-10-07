'use strict'

const util = require('../../util')

const key = 'php-security-checker'
module.exports = {
  key,
  name: 'PHP security-checker',
  description: 'Checks if your composer.lock contains dependencies with known security vulnerabilities',
  enabled: true,
  handles: ({ fm, exec, logger }) => {
    const composerLock = fm.exists('composer.lock')
    const command = exec.commandExists('security-checker.phar')
    if (composerLock && !command) {
      logger.warn('composer.lock found but security-checker.phar not found in $PATH')
      logger.warn(`${key} will not run unless you install security-checker.phar`)
      logger.warn('Please see: https://github.com/sensiolabs/security-checker')
      return false
    }
    return composerLock
  },
  run: ({ fm, exec, results }) => new Promise((resolve, reject) => {
    exec.command('security-checker.phar security:check --format json', { cwd: fm.target }, (err, { stdout }) => {
      if (!util.isEmpty(err)) {
        return reject(err)
      }

      const report = JSON.parse(stdout || '{}')
      Object.keys(report).forEach((dep) => {
        const dependency = report[dep]
        const advisories = dependency.advisories
        Object.keys(advisories).forEach((adv) => {
          const advisory = advisories[adv]
          const item = {
            code: advisory.cve,
            offender: dep,
            description: advisory.title,
            mitigation: advisory.link
          }
          results.high(item)
        })
      })

      resolve()
    })
  })
}
