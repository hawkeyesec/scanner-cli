'use strict'

const path = require('path')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Checks python dependencies for known security vulnerabilities with the safety tool.',
  enabled: true,
  handles: async fm => {
    const requirements = fm.exists('requirements.txt')
    const hasCommand = await exec.exists('safety')
    if (requirements && !hasCommand) {
      logger.warn('requirements.txt found but safety was not found in $PATH')
      logger.warn(`${key} will not run unless you install safety.`)
      logger.warn('Please see: https://github.com/pyupio/safety')
      return false
    }
    return requirements
  },
  run: async fm => {
    const safetyCommand = 'safety check --json -r requirements.txt'
    const unpinnedWarning = 'Warning: unpinned requirement'
    const { stdout } = await exec.command(safetyCommand, { cwd: fm.target })
    const lines = stdout.split('\n')

    lines
      .filter(line => line.startsWith(unpinnedWarning))
      .forEach(unpinnedDependency => logger.warn(unpinnedDependency))

    const vulns = JSON.parse(lines.filter(line => !line.startsWith(unpinnedWarning)).join('\n'))
    return vulns
      .map(result => ({
        code: result[4],
        offender: `${result[0]} ${result[2]}`,
        description: result[3],
        mitigation: `Versions ${result[1]} are vulnerable. Update to a non vulnerable version.`
      }))
      .reduce((results, res) => results.critical(res), new ModuleResults(key))
  }
}
