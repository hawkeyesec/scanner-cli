'use strict'

const path = require('path')
const semver = require('semver')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scans python dependencies for out of date packages',
  enabled: true,
  handles: async fm => {
    const requirements = fm.exists('requirements.txt')
    const hasCommand = await exec.exists('piprot')
    if (requirements && !hasCommand) {
      logger.warn('requirements.txt found but piprot was not found in $PATH')
      logger.warn(`${key} will not run unless you install piprot`)
      logger.warn('Please see: https://github.com/sesh/piprot')
      return false
    }
    return requirements
  },
  run: async fm => {
    const results = new ModuleResults(key)
    const { stdout } = await exec.command('piprot -o', { cwd: fm.target })
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

    return results
  }
}
