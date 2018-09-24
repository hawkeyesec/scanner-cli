'use strict'

const { pick } = require('lodash')
const semver = require('semver')
const util = require('../../util')
const Exec = require('../../exec')

module.exports = function Example (options) {
  options = util.defaultValue(options, {})
  options = util.permittedArgs(options, ['exec'])
  options.exec = util.defaultValue(options.exec, () => new Exec())

  const self = {}
  self.key = require('path').basename(require('path').dirname(__filename))
  self.name = 'npm outdated'
  self.description = 'Checks for outdated npm modules'
  self.enabled = true

  let fm
  self.handles = function (manager) {
    util.enforceType(manager, Object)
    fm = manager
    return fm.exists('package.json')
  }

  self.run = function (results, done) {
    options.exec.command('npm outdated --json', { cwd: fm.target }, (_, { stdout = '{}' }) => {
      const pkg = JSON.parse(fm.readFileSync('package.json'))
      const deps = Object.assign(pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, {})
      const report = JSON.parse(stdout)

      Object.keys(pick(report, Object.keys(deps)))
        .map(name => ({ ...report[name], name }))
        .forEach(({ name: offender, latest, current }) => {
          const mitigation = `Upgrade to v${latest} (Current: v${current})`

          if (semver.major(current) < semver.major(latest)) {
            results.high({ offender, mitigation, code: 1, description: 'Module is one or more major versions out of date' })
          } else if (semver.minor(current) < semver.minor(latest)) {
            results.medium({ offender, mitigation, code: 2, description: 'Module is one or more minor versions out of date' })
          } else if (semver.patch(current) < semver.patch(latest)) {
            results.low({ offender, mitigation, code: 3, description: 'Module is one or more patch versions out of date' })
          }
        })

      done()
    })
  }
  return Object.freeze(self)
}
