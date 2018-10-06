'use strict'

module.exports = {
  /**
   * Module Metadata
   */
  key: 'example',
  name: 'Example Module',
  description: 'Example of how to write a module and shell out a command',

  /**
   * Is the module enabled by default
   */
  enabled: false,

  /**
   * Determines whether the module is able to run on the target
   *
   * @param {FileManager} fm Proxy access to the files within the current scan context
   * @returns {Boolean} true if the module should run, false otherwise
   */
  handles: fileManager => true,

  /**
   * The actual execution of the module.
   *
   * @param {Exec} options.exec Wrapper to execute system commands.
   * @param {Results} options.results Proxy to output messages
   * @param {FileManager} options.fm Proxy access to the files within the current scan context
   * @param {Logger} options.logger The project-wide logger
   * @returns {Promise}
   */
  run: options => new Promise(function (resolve, reject) {
    const exec = options.exec
    const results = options.target
    const fm = options.fm
    const cwd = fm.target
    const command = 'ls -al'
    exec.command(command, { cwd }, (_, { stderr, stdout }) => {
      results.low({ offender: '', code: 4, description: '', mitigation: '' })
      results.medium({ offender: '', code: 3, description: '', mitigation: '' })
      results.high({ offender: '', code: 2, description: '', mitigation: '' })
      results.critical({ offender: '', code: 1, description: '', mitigation: '' })
    })

    resolve()
  })
}
