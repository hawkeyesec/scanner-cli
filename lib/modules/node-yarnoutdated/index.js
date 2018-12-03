'use strict'

const path = require('path')
const semver = require('semver')
const exec = require('../../exec')
const ModuleResults = require('../../results')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Checks node projects for outdated yarn modules',
  enabled: true,
  handles: async fm => {
    const isYarnProject = fm.exists('package.json') && fm.exists('yarn.lock')
    const hasCommand = await exec.exists('yarn')

    if (isYarnProject && !hasCommand) {
      logger.warn('yarn.lock found but yarn was not found in $PATH')
      logger.warn(`node-yarnaudit scan will not run unless you install Yarn`)
      return false
    }

    return isYarnProject
  },
  run: async fm => {
    const { stdout = '{}' } = await exec.command('yarn outdated --json', { cwd: fm.target })
    return stdout
      .trim()
      .split('\n')
      .map(l => JSON.parse(l || '{}'))
      .filter(l => l.type === 'table')
      .map(finding => finding.data.body)
      .reduce((flatmap, results) => flatmap.concat(results), [])
      .reduce((results, [offender, current, _, latest]) => {
        // check if semver can parse the versions at all
        if (!semver.parse(current) || !semver.parse(latest)) return results

        const mitigation = `Upgrade to v${latest} (Current: v${current})`

        if (semver.major(current) < semver.major(latest)) {
          results.high({ offender, mitigation, code: `${offender}-1`, description: 'Module is one or more major versions out of date' })
        } else if (semver.minor(current) < semver.minor(latest)) {
          results.medium({ offender, mitigation, code: `${offender}-2`, description: 'Module is one or more minor versions out of date' })
        } else if (semver.patch(current) < semver.patch(latest)) {
          results.low({ offender, mitigation, code: `${offender}-3`, description: 'Module is one or more patch versions out of date' })
        }

        return results
      }, new ModuleResults(key))
  }
}
