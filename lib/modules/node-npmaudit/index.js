'use strict'

const _ = require('lodash')
const Exec = require('../../exec')

const offender = 'Vulnerable npm dependency'
const mitigation = 'Run npm audit for further information'

module.exports = {
  key: 'node-npmaudit',
  name: 'npm audit',
  description: 'Checks for known security vulnerabilities in your npm dependencies',
  enabled: true,
  handles: ({ fm }) => fm.exists('package.json') && fm.exists('package-lock.json'),
  run: ({ fm, exec = new Exec(), results }) => new Promise(function (resolve, reject) {
    exec.command('npm audit --json', { cwd: fm.target }, (e, { stdout = '{}' }) => {
      const report = JSON.parse(stdout)
      const { low, moderate, high, critical } = _.get(report, ['metadata', 'vulnerabilities'], {})

      low > 0 && results.low({ offender, code: 4, description: `Found ${low} dependencies with low-severity vulnerabilities`, mitigation })
      moderate > 0 && results.medium({ offender, code: 3, description: `Found ${moderate} dependencies with medium-severity vulnerabilities`, mitigation })
      high > 0 && results.high({ offender, code: 2, description: `Found ${high} dependencies with high-severity vulnerabilities`, mitigation })
      critical > 0 && results.critical({ offender, code: 1, description: `Found ${critical} dependencies with critical-severity vulnerabilities`, mitigation })

      resolve()
    })
  })
}
