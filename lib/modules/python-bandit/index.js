'use strict'

const logger = require('../../logger')
const ModuleResults = require('../../results')
const _ = require('lodash')
const exec = require('../../exec')

const key = 'python-bandit'
module.exports = {
  key,
  name: 'Bandit Scan',
  description: 'Bandit find common security issues in Python code.',
  enabled: true,
  handles: async fm => {
    const hasRequirementsFile = fm.exists('requirements.txt')
    const hasCommand = await exec.exists('bandit')
    if (hasRequirementsFile && !hasCommand) {
      logger.warn('requirements.txt found but bandit was not found in $PATH')
      logger.warn(`${key} will not run unless you install bandit`)
      logger.warn('Please see: https://github.com/openstack/bandit')
      return false
    }
    return hasRequirementsFile
  },
  run: async fm => {
    let banditCommand = 'bandit -r . -f json'
    if (fm.excluded && fm.excluded.length > 0) {
      banditCommand = banditCommand + ' -x ' + fm.excluded
    }

    const { stdout } = await exec.command(banditCommand, { cwd: fm.target })
    const report = JSON.parse(stdout || '{}')
    return _.get(report, 'results', [])
      .map(error => ({
        code: error.test_id,
        offender: `${error.filename} lines ${error.line_range}`,
        description: `${error.test_name} ${error.test_id}`,
        mitigation: `${error.issue_text} Review the file and fix the issue.`,
        level: error.issue_severity.toLowerCase()
      }))
      .reduce((results, res) => results[res.level](res), new ModuleResults(key))
  }
}
