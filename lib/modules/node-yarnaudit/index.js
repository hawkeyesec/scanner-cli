'use strict'

const path = require('path')
const _ = require('lodash')
const ModuleResults = require('../../results')
const exec = require('../../exec')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()

module.exports = {
  key,
  description: 'Checks yarn projects for dependencies with known vulnerabilities',
  enabled: true,
  handles: async fm => {
    const isYarnProject = fm.exists('package.json') && fm.exists('yarn.lock')
    const hasCommand = await exec.exists('yarn')

    if (isYarnProject && !hasCommand) {
      logger.warn('yarn.lock found but yarn was not found in $PATH')
      logger.warn(`node-yarnaudit scan will not run unless you install Yarn`)
      return false
    }

    return isYarnProject
  },
  run: async fm => {
    const { stdout = '{}' } = await exec.command('yarn audit --json', { cwd: fm.target })
    return stdout
      .trim()
      .split('\n')
      .map(l => JSON.parse(l))
      .filter(l => l.type === 'auditAdvisory')
      .map(l => l.data.advisory)
      .map(adv => ({
        offender: adv.module_name,
        code: `${adv.module_name}-${adv.id}`,
        description: adv.title,
        mitigation: `Ingested via ${_.uniq(_.flatMap(_.get(adv, 'findings', []).map(f => _.get(f, 'paths', ''))).map(f => f.split('>')[0])).join(', ')}`,
        level: mapSeverity(adv.severity)
      }))
      .reduce((results, res) => results[res.level](res), new ModuleResults(key))
  }
}

const mapSeverity = severity => {
  switch (severity) {
    case 'critical': return 'critical'
    case 'high': return 'high'
    case 'moderate': return 'medium'
    default:
      return 'low'
  }
}
