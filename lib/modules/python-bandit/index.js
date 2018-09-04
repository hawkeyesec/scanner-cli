'use strict'
const util = require('../../util')
const Exec = require('../../exec')

module.exports = function Bandit (options) {
  options = util.defaultValue(options, {})
  options = util.permittedArgs(options, ['exec', 'logger'])
  options.exec = util.defaultValue(options.exec, () => new Exec())

  const self = {}
  self.key = require('path').basename(require('path').dirname(__filename))
  self.name = 'Bandit Scan'
  self.description = 'Bandit find common security issues in Python code.'
  self.enabled = true
  let fileManager

  self.handles = function (manager) {
    util.enforceType(manager, Object)
    fileManager = manager
    const requirements = fileManager.exists('requirements.txt')
    if (requirements && !options.exec.commandExists('bandit')) {
      options.logger.warn('requirements.txt found but bandit was not found in $PATH')
      options.logger.warn(`${self.key} will not run unless you install bandit`)
      options.logger.warn('Please see: https://github.com/openstack/bandit')
      return false
    }
    return requirements
  }

    function buildBanditCommand() {
        let banditCommand = 'bandit -r . -f json';
        if (fileManager.excluded && fileManager.excluded.length > 0) {
            banditCommand = banditCommand + " -x " + fileManager.excluded;
        }
        return banditCommand;
    }
    
  self.run = function (results, done) {
    const banditCommand = buildBanditCommand()
    options.exec.command(banditCommand, { cwd: fileManager.target }, (_, data) => {
      const errors = JSON.parse(data.stdout).results
      if (errors.length === 0) { return done() }

      errors.forEach(error => {
        const item = {
          code: error.test_id,
          offender: `${error.filename} lines ${error.line_range}`,
          description: `${error.test_name} ${error.test_id}`,
          mitigation: `${error.issue_text} Review the file and fix the issue.`
        }
        results[error.issue_severity.toLowerCase()](item)
      })

      done()
    })
  }

  return Object.freeze(self)
}
