'use strict'

const semver = require('semver')

const key = 'python-piprot'
module.exports = {
  key,
  name: 'Python Outdated Dependencies Scan',
  description: 'Scans a requirements.txt for out of date packages',
  enabled: true,
  handles: ({ fm, exec, logger }) => {
    const requirements = fm.exists('requirements.txt')
    if (requirements && !exec.commandExists('piprot')) {
      logger.warn('requirements.txt found but piprot was not found in $PATH')
      logger.warn(`${key} will not run unless you install bandit`)
      logger.warn('Please see: https://github.com/sesh/piprot')
      return false
    }
    return requirements
  },
  run: ({ fm, exec, results }) => new Promise(function (resolve, reject) {
    exec.command('piprot -o', { cwd: fm.target }, (_, { stdout = '' }) => {
      stdout
        .split('\n')
        .slice(0, -1)
        .map(line => ({
          offender: line.substring(0, line.indexOf('(')).trim(),
          current: line.substring(line.indexOf('(') + 1, line.indexOf(')')),
          latest: line.substring(line.lastIndexOf(' ') + 1)
        }))
        .filter(({ current, latest }) => semver.valid(current) && semver.valid(latest))
        .forEach(({ offender, current, latest }) => {
          const mitigation = `Upgrade to v${latest} (Current: v${current})`

          if (semver.major(current) < semver.major(latest)) {
            results.high({ offender, mitigation, code: 1, description: 'Module is one or more major versions out of date' })
          } else if (semver.minor(current) < semver.minor(latest)) {
            results.medium({ offender, mitigation, code: 2, description: 'Module is one or more minor versions out of date' })
          } else if (semver.patch(current) < semver.patch(latest)) {
            results.low({ offender, mitigation, code: 3, description: 'Module is one or more patch versions out of date' })
          }
        })

      resolve()
    })
  })
}
