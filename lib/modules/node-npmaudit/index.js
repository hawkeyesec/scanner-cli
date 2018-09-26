'use strict'

const util = require('../../util')
const Exec = require('../../exec')

module.exports = function Example (options) {
  options = util.defaultValue(options, {})
  options = util.permittedArgs(options, ['exec'])
  options.exec = util.defaultValue(options.exec, () => new Exec())

  const self = {}
  self.key = require('path').basename(require('path').dirname(__filename))
  self.name = 'npm audit'
  self.description = 'Checks for known security vulnerabilities in your npm dependencies'
  self.enabled = true

  let fm
  self.handles = function (manager) {
    util.enforceType(manager, Object)
    fm = manager
    return fm.exists('package.json') && fm.exists('package-lock.json')
  }

  self.run = function (results, done) {
    options.exec.command('npm audit --json', { cwd: fm.target }, (_, { stdout = '{}' }) => {
      const report = JSON.parse(stdout)
      const { low, moderate, high, critical } = report.metadata.vulnerabilities

      const offender = 'Vulnerable npm dependency'
      const mitigation = 'Run npm audit for further information'
      low > 0 && results.low({ offender, code: 4, description: `Found ${low} dependencies with low-severity vulnerabilities`, mitigation })
      moderate > 0 && results.medium({ offender, code: 3, description: `Found ${moderate} dependencies with medium-severity vulnerabilities`, mitigation })
      high > 0 && results.high({ offender, code: 2, description: `Found ${high} dependencies with high-severity vulnerabilities`, mitigation })
      critical > 0 && results.critical({ offender, code: 1, description: `Found ${critical} dependencies with critical-severity vulnerabilities`, mitigation })

      done()
    })
  }
  return Object.freeze(self)
}
