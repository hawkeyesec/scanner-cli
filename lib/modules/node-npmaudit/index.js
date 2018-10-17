'use strict'

const path = require('path')
const _ = require('lodash')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const offender = 'Vulnerable npm dependency'
const mitigation = 'Run npm audit for further information'
const key = __dirname.split(path.sep).pop()

module.exports = {
  key,
  description: 'Checks node projects for dependencies with known vulnerabilities',
  enabled: true,
  handles: async fm => fm.exists('package.json') && fm.exists('package-lock.json'),
  run: async fm => {
    const { stdout = '{}' } = await exec.command('npm audit --json', { cwd: fm.target })
    const report = JSON.parse(stdout)
    const { low, moderate, high, critical } = _.get(report, ['metadata', 'vulnerabilities'], {})

    const results = new ModuleResults(key)
    low > 0 && results.low({ offender, code: 4, description: `Found ${low} dependencies with low-severity vulnerabilities`, mitigation })
    moderate > 0 && results.medium({ offender, code: 3, description: `Found ${moderate} dependencies with medium-severity vulnerabilities`, mitigation })
    high > 0 && results.high({ offender, code: 2, description: `Found ${high} dependencies with high-severity vulnerabilities`, mitigation })
    critical > 0 && results.critical({ offender, code: 1, description: `Found ${critical} dependencies with critical-severity vulnerabilities`, mitigation })

    return results
  }
}
