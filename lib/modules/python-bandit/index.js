'use strict'

const key = 'python-bandit'
module.exports = {
  key,
  name: 'Bandit Scan',
  description: 'Bandit find common security issues in Python code.',
  enabled: true,
  handles: ({ fm, exec, logger }) => {
    const requirements = fm.exists('requirements.txt')
    if (requirements && !exec.commandExists('bandit')) {
      logger.warn('requirements.txt found but bandit was not found in $PATH')
      logger.warn(`${key} will not run unless you install bandit`)
      logger.warn('Please see: https://github.com/openstack/bandit')
      return false
    }
    return requirements
  },
  run: ({ fm, exec, results }) => new Promise(function (resolve, reject) {
    let banditCommand = 'bandit -r . -f json'
    if (fm.excluded && fm.excluded.length > 0) {
      banditCommand = banditCommand + ' -x ' + fm.excluded
    }

    exec.command(banditCommand, { cwd: fm.target }, (_, { stdout = '{}' }) => {
      const errors = JSON.parse(stdout || '{}').results
      if (!errors || errors.length === 0) { return resolve() }

      errors.forEach(error => {
        const item = {
          code: error.test_id,
          offender: `${error.filename} lines ${error.line_range}`,
          description: `${error.test_name} ${error.test_id}`,
          mitigation: `${error.issue_text} Review the file and fix the issue.`
        }
        results[error.issue_severity.toLowerCase()](item)
      })

      resolve()
    })
  })
}
