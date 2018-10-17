'use strict'
const FileManager = require('./file-manager')
const modules = require('./modules')
const logger = require('./logger')
const _ = require('lodash')
require('colors')

module.exports = async (rc = {}) => {
  logger.log('Target for scan:', rc.target)
  const fm = new FileManager(rc)

  const allModules = modules()

  let knownModules = _.isEqual(rc.modules, ['all'])
    ? allModules.filter(m => m.enabled)
    : allModules.filter(m => rc.modules.indexOf(m.key) > -1)

  let unknownModules = _.isEqual(rc.modules, ['all'])
    ? []
    : _.difference(rc.modules, allModules.map(m => m.key))
  unknownModules.forEach(key => logger.warn('Unknown module:'.bold, key))

  if (!knownModules.length) {
    throw new Error('No available modules to scan with!')
  }

  const activeModules = []
  const inactiveModules = []
  for (const module of knownModules) {
    logger.log(`Checking ${module.key} for applicability`)
    const isActive = await module.handles(fm)
    ;(isActive ? activeModules : inactiveModules).push(module)
  }
  inactiveModules.forEach(module => logger.log('Skipping module'.bold, module.key))

  if (!activeModules.length) {
    throw new Error('We found no modules that would run on the target folder')
  }

  const results = []
  for (const module of activeModules) {
    logger.log('Running module'.bold, module.key)
    try {
      const result = await module.run(fm)
      results.push(result)
    } catch (e) {
      logger.error(module.key, 'returned an error!', e.message)
    }
  }

  return results.map(result => {
    let tmp = result.results
    switch (rc.threshold) {
      case 'critical':
        delete tmp.high
        delete tmp.medium
        delete tmp.low
        break
      case 'high':
        delete tmp.medium
        delete tmp.low
        break
      case 'medium':
        delete tmp.low
        break
      default:
        break
    }
    return {
      module: result.key,
      results: tmp
    }
  })
}
