'use strict'

const path = require('path')
const fs = require('fs')
const tmp = require('tmp')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Statically analyzes Rails code for security issues with Brakeman.',
  enabled: true,
  handles: async fm => {
    const isRubyProject = fs.existsSync(path.join(fm.target, 'Gemfile'))
    const isRailsApp = isRubyProject && fm.readFileSync('Gemfile').indexOf('rails') >= 0
    const containsAppFolder = fs.existsSync(path.join(fm.target, 'app'))
    const shouldHandle = isRubyProject && isRailsApp
    const hasCommand = await exec.exists('brakeman')

    if (shouldHandle && !hasCommand) {
      logger.warn('Rails project found but brakeman not found in $PATH')
      logger.warn(`${key} will not run unless you install brakeman`)
      logger.warn('Please see: https://brakemanscanner.org/docs/install/')
      return false
    }

    if (shouldHandle && !containsAppFolder) {
      logger.warn('Rails project found but app folder was not found')
      logger.warn(`${key} only run on Rails projects with an app folder`)
      return false
    }

    return shouldHandle
  },
  run: async (fm, reportFile) => {
    reportFile = reportFile || path.resolve(tmp.dirSync().name, 'report.json')

    await exec.command(`brakeman . -f json -o ${reportFile}`, { cwd: fm.target, shell: '/bin/bash' })
    if (!fs.existsSync(reportFile)) {
      throw new Error('There was an error while executing Brakeman and the report was not created')
    }

    return JSON.parse(fs.readFileSync(reportFile))
      .warnings
      .map(warning => ({
        code: warning.check_name,
        offender: `${warning.file}`,
        description: `${warning.message} (${warning.link})`,
        mitigation: `Check line ${warning.line}`
      }))
      .reduce((results, res) => results.high(res), new ModuleResults(key))
  }
}
