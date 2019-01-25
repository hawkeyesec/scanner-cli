'use strict'

const path = require('path')
const { pick } = require('lodash')
const semver = require('semver')
const exec = require('../../exec')
const ModuleResults = require('../../results')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Checks node projects for outdated npm modules',
  enabled: true,
  handles: async fm => {
    const isNpmProject = fm.exists('package.json') && fm.exists('package-lock.json')
    const hasCommand = await exec.exists('npm')

    if (isNpmProject && !hasCommand) {
      logger.warn('package-lock.json found but npm was not found in $PATH')
      logger.warn(`node-npmoutdated scan will not run unless you install Npm`)
      return false
    }

    return isNpmProject
  },
  run: async fm => {
    const { stdout = '{}' } = await exec.command('npm outdated --json', { cwd: fm.target })
    const pkg = JSON.parse(fm.readFileSync('package.json'))
    const deps = Object.assign(
      pkg.dependencies || {},
      pkg.devDependencies || {},
      pkg.optionalDependencies || {},
      {}
    )
    const report = JSON.parse(stdout || '{}')
    const results = new ModuleResults(key)

    Object.keys(pick(report, Object.keys(deps)))
      .map(name => ({ ...report[name], name }))
      .forEach(({ name: offender, latest, current }) => {
        // check if semver can parse the versions at all
        if (!semver.parse(current) || !semver.parse(latest)) return

        const mitigation = `Upgrade to v${latest} (Current: v${current})`

        if (semver.major(current) < semver.major(latest)) {
          results.high({ offender, mitigation, code: `${offender}-1`, description: 'Module is one or more major versions out of date' })
        } else if (semver.minor(current) < semver.minor(latest)) {
          results.medium({ offender, mitigation, code: `${offender}-2`, description: 'Module is one or more minor versions out of date' })
        } else if (semver.patch(current) < semver.patch(latest)) {
          results.low({ offender, mitigation, code: `${offender}-3`, description: 'Module is one or more patch versions out of date' })
        }
      })

    return results
  }
}
