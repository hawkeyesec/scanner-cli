'use strict'

const path = require('path')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Statically analyzes Rails code for security issues with Brakeman.',
  enabled: true,
  handles: async fm => {
    const isRubyProject = fm.exists('Gemfile')
    const isRailsApp = isRubyProject && fm.readFileSync('Gemfile').indexOf('rails') >= 0
    const containsAppFolder = fm.exists('app')
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
  run: async fm => {
    await exec.command(`brakeman . -f json -o ${fm.target}/output.json`, { cwd: fm.target })
    if (!fm.exists('output.json')) {
      throw new Error('There was an error while executing Brakeman and the report was not created')
    }

    return JSON.parse(fm.readFileSync('output.json'))
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
