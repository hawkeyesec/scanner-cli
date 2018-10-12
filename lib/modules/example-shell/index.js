'use strict'

const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = 'example'
module.exports = {
  /**
   * Module Metadata
   */
  key,
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
  handles: fm => true,

  /**
   * The actual execution of the module.
   *
   * @param {FileManager} fm Proxy access to the files within the current scan context
   * @returns {Promise}
   */
  run: async fm => {
    const results = new ModuleResults(key)
    const { stdout } = exec.command('ls -al', { cwd: fm.target })
    results.low({ offender: '', code: 4, description: '', mitigation: '' })
    results.medium({ offender: '', code: 3, description: '', mitigation: '' })
    results.high({ offender: '', code: 2, description: '', mitigation: '' })
    results.critical({ offender: '', code: 1, description: '', mitigation: '' })

    return results
  }
}
