'use strict'
const util = require('./util')
const FileManager = require('./file-manager')
const Modules = require('./modules')
const logger = require('./logger')
const Exec = require('./exec')
require('colors')

class ModuleResults {
  constructor (key) {
    this.key = key
    this.data = {
      high: [],
      medium: [],
      low: [],
      critical: []
    }
  }
  critical ({ code, offender, description, mitigation }) {
    this.data['critical'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
  }
  high ({ code, offender, description, mitigation }) {
    this.data['high'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
  }
  medium ({ code, offender, description, mitigation }) {
    this.data['medium'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
  }
  low ({ code, offender, description, mitigation }) {
    this.data['low'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
  }
  get results () {
    return this.data
  }
}

module.exports = function Scan (rc = {}) {
  const moduleIndex = new Modules(rc)
  const modules = moduleIndex.asArray
  rc.target = moduleIndex.target
  const fm = new FileManager(rc)
  const exec = rc.exec || new Exec()

  logger.log('Target for scan:', rc.target)
  const self = {}

  self.start = async function (done) {
    util.enforceNotEmpty(modules, 'You must specify the modules to scan')
    const allResults = []

    let enabledModules = []
    const whichModules = rc.modules
    if (whichModules[0] === 'all') {
      enabledModules = modules.filter(m => m.enabled)
    } else {
      whichModules.forEach(key => {
        const module = modules.find(m => m.key === key)
        if (util.isEmpty(module)) {
          logger.warn('Unknown module:', key)
        } else {
          enabledModules.push(module)
        }
      })
    }
    const inactiveModules = enabledModules.filter(module => !module.handles({ exec, fm }))
    inactiveModules.forEach(module => logger.log('Skipping module'.bold, module.name))

    const activeModules = enabledModules.filter(module => module.handles({ exec, fm }))
    for (const module of activeModules) {
      try {
        logger.log('Running module'.bold, module.name)
        const results = new ModuleResults(module.key)
        allResults.push(results)
        await module.run({ exec, fm, results })
      } catch (e) {
        logger.error(module.name, 'returned an error!', e.message)
      }
    }

    const output = allResults.map(result => {
      var tmpresults = result.results
      switch (rc.threshold) {
        case 'critical':
          delete tmpresults.high
          delete tmpresults.medium
          delete tmpresults.low
          break
        case 'high':
          delete tmpresults.medium
          delete tmpresults.low
          break
        case 'medium':
          delete tmpresults.low
          break
        default:
          break
      }
      return {
        module: result.key,
        results: result.results
      }
    })
    done(null, output)
  }
  return Object.freeze(self)
}
