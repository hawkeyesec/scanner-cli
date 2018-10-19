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

  let results = await activeModules
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

  const threshold = { low: 1, medium: 2, high: 4, critical: 8 }

  results = results
    .map(({ key, data }) => ({
      critical: data.critical.map(res => Object.assign({ module: key, level: 'critical' }, res, {})),
      high: data.high.map(res => Object.assign({ module: key, level: 'high' }, res, {})),
      medium: data.medium.map(res => Object.assign({ module: key, level: 'medium' }, res, {})),
      low: data.low.map(res => Object.assign({ module: key, level: 'low' }, res, {}))
    }))
    .map(module => Object.keys(module).reduce((acc, lvl) => acc.concat(module[lvl]), []))
    .reduce((flatmap, results) => flatmap.concat(results), [])
    .filter(res => threshold[res.level] >= threshold[rc.failOn])
    .filter(res => !rc.exclude.reduce((isMatch, next) => isMatch || next.test(res.code), false))
    .map(res => rc.showCode ? res : _.omit(res, ['code']))

  logger.log(`Scan complete, ${results.length} issues found`)

  for (const { key, write, opts } of rc.writers) {
    logger.log(`Writing to: ${key}`)
    await write(results, opts)
  }

  return results.length ? 1 : 0
}
