'use strict'

const { existsSync, readFileSync } = require('fs')
const path = require('path')
const exec = require('../../exec')
const ModuleResults = require('../../results')
const logger = require('../../logger')
const tmp = require('tmp')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: '',
  enabled: true,
  handles: async fm => {
    const allFiles = fm.all()

    const isMavenProject = allFiles.some(file => file === 'pom.xml')
    const hasCommand = await exec.exists('mvn')

    if (isMavenProject && !hasCommand) {
      logger.warn('pom.xml found but mvn executable was not found in $PATH')
      logger.warn('java-outdated-dependencies will not run unless you install Maven')
      return false
    }

    return isMavenProject
  },
  run: async (fm, reportFile) => {
    reportFile = reportFile || path.resolve(tmp.dirSync().name, 'report.txt')
    const results = new ModuleResults(key)
    const data = await exec.command(`mvn --batch-mode versions:display-dependency-updates -Dversions.outputFile=${reportFile}`, { cwd: fm.target, stdio: ['ignore', 'ignore', 'pipe'] })

    if (!existsSync(reportFile)) {
      throw new Error(`There was an error while executing maven versions plugin and the report was not created: ${JSON.stringify(data.stderr || data.stdout)}`)
    }

    const report = readFileSync(reportFile)

    const lines = report.toString().trim().split('\n')

    const depedencyLineRegex = /(\S+)\s\.+\s(\S+)\s->\s(\S+)/
    const dependenciesLines = lines.slice(1, lines.length - 2)

    for (let i = 0; i < dependenciesLines.length; i++) {
      let line = dependenciesLines[i]
      if (!line.includes('->')) { // the jar name is too long to fit in one line so maven breaks that up in two lines
        line = `${line} ${dependenciesLines[i + 1].trim()}`
        i++
      }
      const matches = line.match(depedencyLineRegex)
      results.low(
        {
          code: `${matches[1]}`,
          offender: `${matches[1]}:${matches[2]}`,
          description: '',
          mitigation: `Update to ${matches[1]} ${matches[3]}`
        }
      )
    }
    return results
  }
}
