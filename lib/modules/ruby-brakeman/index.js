'use strict'

const logger = require('../../logger')

const key = 'ruby-brakeman'
module.exports = {
  key,
  name: 'Brakeman Scan',
  description: 'Brakeman statically analyzes Rails application code to find security issues.',
  enabled: true,
  handles: ({ fm, exec }) => {
    const isRubyProject = fm.exists('Gemfile')
    const isRailsApp = isRubyProject && fm.readFileSync('Gemfile').indexOf('rails') >= 0
    const containsAppFolder = fm.exists('app')
    const shouldHandle = isRubyProject && isRailsApp

    if (shouldHandle && !exec.commandExists('brakeman')) {
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
  run: ({ fm, exec, results }) => new Promise(function (resolve, reject) {
    const command = `brakeman . -f json -o ${fm.target}/output.json`
    exec.command(command, { cwd: fm.target }, () => {
      if (!fm.exists('output.json')) {
        return reject(new Error('There was an error while executing Brakeman and the report was not created'))
      }

      JSON.parse(fm.readFileSync('output.json'))
        .warnings
        .map(warning => ({
          code: warning.check_name,
          offender: `${warning.file}`,
          description: `${warning.message} (${warning.link})`,
          mitigation: `Check line ${warning.line}`
        }))
        .forEach(results.high)

      resolve()
    })
  })
}
