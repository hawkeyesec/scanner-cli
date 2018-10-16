'use strict'

const { pick } = require('lodash')
const semver = require('semver')
const exec = require('../../exec')
const ModuleResults = require('../../results')

const key = 'node-npmoutdated'
module.exports = {
  key,
  name: 'npm outdated',
  description: 'Checks for outdated npm modules',
  enabled: true,
  handles: async fm => fm.exists('package.json'),
  run: async fm => {
    const { stdout = '{}' } = await exec.command('npm outdated --json', { cwd: fm.target })
    const pkg = JSON.parse(fm.readFileSync('package.json'))
    const deps = Object.assign(pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, {})
    const report = JSON.parse(stdout || '{}')
    const results = new ModuleResults(key)

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

    return results
  }
}
