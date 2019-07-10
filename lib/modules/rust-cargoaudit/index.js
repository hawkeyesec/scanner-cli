'use strict'

const path = require('path')
const fs = require('fs')
const ModuleResults = require('../../results')
const exec = require('../../exec')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()

module.exports = {
  key,
  description: 'Checks Rust projects for dependencies with known vulnerabilities',
  enabled: true,
  handles: async fm => {
    const isRustProject = fs.existsSync(path.join(fm.target, 'Cargo.toml'))
    const hasCommand = await exec.exists('cargo')

    if (isRustProject && !hasCommand) {
      logger.warn('Cargo.lock found but cargo was not found in $PATH')
      logger.warn(`${key} scan will not run unless you install cargo`)
      return false
    }

    return isRustProject
  },
  run: async fm => {
    let lockFileWasGeneratedByTheModule = false
    try {
      if (!fs.existsSync(path.join(fm.target, 'Cargo.lock'))) {
        await exec.command('cargo generate-lockfile', { cwd: fm.target })
        lockFileWasGeneratedByTheModule = true
      }
      const { stdout } = await exec.command('cargo audit --json', { cwd: fm.target })
      const report = JSON.parse(stdout)
      const vulnerabilities = report.vulnerabilities.list

      return vulnerabilities
        .map(v => {
          const adv = v.advisory
          const pkg = v.package
          const patchedVersionsText = adv.patched_versions.join(', ')
          return {
            offender: `${pkg.name}=${pkg.version}`,
            code: adv.id,
            description: `${adv.title} (${adv.url})`,
            mitigation: `Update "${adv.package}" crate to one of the following versions: ${patchedVersionsText}`
          }
        })
        .reduce((results, v) => results.critical(v), new ModuleResults(key))
    } finally {
      if (lockFileWasGeneratedByTheModule) {
        fs.unlinkSync(path.join(fm.target, 'Cargo.lock'))
      }
    }
  }
}
