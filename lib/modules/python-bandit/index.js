'use strict'

const path = require('path')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const _ = require('lodash')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scans for common security issues in Python code with bandit.',
  enabled: true,
  handles: async fm => {
    const isPythonProject = fm.all().some(file => file.endsWith('.py'))
    const hasCommand = await exec.exists('bandit')
    if (isPythonProject && !hasCommand) {
      logger.warn('Python files were found but bandit was not found in $PATH')
      logger.warn(`${key} will not run unless you install bandit`)
      logger.warn('Please see: https://github.com/openstack/bandit')
      return false
    }
    return isPythonProject
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
