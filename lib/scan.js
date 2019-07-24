'use strict'
const FileManager = require('./file-manager')
const modules = require('./modules')
const logger = require('./logger')
const _ = require('lodash')
const { ScanResults } = require('./scan-results.js')
require('colors')

module.exports = async (rc = {}) => {
  logger.log('Target for scan:', rc.target)
  const fm = new FileManager(rc)

  const allModules = modules()

  const knownModules = _.isEqual(rc.modules, ['all'])
    ? allModules.filter(m => m.enabled)
    : allModules.filter(m => rc.modules.indexOf(m.key) > -1)

  const unknownModules = _.isEqual(rc.modules, ['all'])
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

  let moduleResultsList = await activeModules
    .reduce((prom, { key, run }) => prom.then(async allRes => {
      logger.log('Running module'.bold, key)
      try {
        const res = await run(fm)
        return allRes.concat(res)
      } catch (e) {
        logger.error(key, 'returned an error!', e.message)
        return allRes
      }
    }), Promise.resolve([]))

  const scanResults = ScanResults.fromModuleResultsList(moduleResultsList)
    .allWithLevelAtLeast(rc.failOn)
    .filter(res => !rc.isExcluded(res.code))
    .map(res => rc.showCode ? res : _.omit(res, ['code']))

  logger.log(`Scan complete, ${scanResults.length} issues found`)

  for (const { key, write, opts } of rc.writers) {
    logger.log(`Writing to: ${key}`)
    await write(scanResults, opts)
  }

  return scanResults.length ? 1 : 0
}
