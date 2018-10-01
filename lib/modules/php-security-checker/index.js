'use strict'

const util = require('../../util')
const Exec = require('../../exec')

module.exports = function SecurityChecker (options) {
  options = util.defaultValue(options, {})
  options = util.permittedArgs(options, ['exec'])
  options.exec = util.defaultValue(options.exec, () => new Exec())

  const self = {}
  self.key = require('path').basename(require('path').dirname(__filename))
  self.name = 'PHP security-checker'
  self.description = 'Checks if your composer.lock contains dependencies with known security vulnerabilities'
  self.enabled = true

  let fm
  self.handles = function (manager) {
    util.enforceType(manager, Object)
    fm = manager
    const composerLock = fm.exists('composer.lock')
    const command = options.exec.commandExists('security-checker.phar')
    if (composerLock && !command) {
      options.logger.warn('composer.lock found but security-checker.phar not found in $PATH')
      options.logger.warn(self.key + ' will not run unless you install security-checker.phar')
      options.logger.warn('Please see: https://github.com/sensiolabs/security-checker')
      return false
    }
    return composerLock
  }

  const resultParser = (report, results) => {
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
  }

  self.run = function (results, done) {
    options.exec.command('security-checker.phar security:check --format json', { cwd: fm.target }, (err, data) => {
      if (!util.isEmpty(err)) {
        return done(err)
      }

      const report = JSON.parse(data.stdout.toString())
      resultParser(report, results)
      done()
    })
  }
  return Object.freeze(self)
}
