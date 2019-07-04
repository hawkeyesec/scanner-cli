'use strict'

const { existsSync, readFileSync } = require('fs')
const path = require('path')
const exec = require('../../exec')
const logger = require('../../logger')
const ModuleResults = require('../../results')
const tmp = require('tmp')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scans Java projects for gradle/maven dependencies with known vulnerabilities with the OWASP dependency checker',
  enabled: true,
  handles: async fm => {
    const isJavaProject = fm.all().some(file => file.endsWith('.java'))
    const isKotlinProject = fm.all().some(file => file.endsWith('.kt'))
    const isJvmProject = isJavaProject || isKotlinProject

    const hasJarFiles = getProjectJars(fm).length > 0
    const hasCommand = await exec.exists('dependency-check')

    if (isJvmProject && !hasJarFiles) {
      logger.warn('java files were found but no jar files')
      logger.warn(`java-owasp scan will not run unless you build the project before`)
      return false
    }

    if (isJvmProject && hasJarFiles && !hasCommand) {
      logger.warn('java files found but dependency-check was not found in $PATH')
      logger.warn(`java-owasp scan will not run unless you install Owasp Dependency Check CLI`)
      logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/owaspDependencyCheck/README.md')
      return false
    }

    return isJvmProject && hasJarFiles
  },
  run: async (fm, reportFile) => {
    reportFile = reportFile || path.resolve(tmp.dirSync().name, 'report.json')

    const jarFiles = getProjectJars(fm).map(getAbsolutePath(fm)).join(' -s ')
    const command = `dependency-check --noupdate --format JSON --out ${reportFile} -s . -s ${jarFiles}`
    const data = await exec.command(command, { cwd: fm.target })

    if (!existsSync(reportFile)) {
      throw new Error(`There was an error while executing Owasp Dependency Check and the report was not created: ${JSON.stringify(data.stderr || data.stdout)}`)
    }

    const report = readFileSync(reportFile)
    const { dependencies = [] } = JSON.parse(report)
    const results = new ModuleResults(key)

    dependencies.forEach(dependency => {
      if (Array.isArray(dependency.vulnerabilities)) {
        dependency.vulnerabilities.forEach(vulnerability => {
          let offender = dependency.fileName
          if (offender.includes(' ')) {
            const offenderIndex = offender.indexOf(' ')
            offender = dependency.fileName.slice(offenderIndex).trim()
          }

          const item = {
            code: vulnerability.name,
            offender: offender,
            description: `https://nvd.nist.gov/vuln/detail/${vulnerability.name}`,
            mitigation: 'See the CVE link on the description column.'
          }

          results[vulnerability.severity.toLowerCase()](item)
        })
      }
    })

    return results
  }
}

const getProjectJars = (fm) => {
  const mavenTargetFolder = 'target'
  const gradleBuildFolder = 'build'
  let allFiles = []

  if (existsSync(path.join(fm.target, mavenTargetFolder))) {
    allFiles = allFiles.concat(fm.getAllFilesSync(mavenTargetFolder))
  }

  if (existsSync(path.join(fm.target, gradleBuildFolder))) {
    allFiles = allFiles.concat(fm.getAllFilesSync(gradleBuildFolder))
  }

  allFiles = allFiles.concat(fm.getAllFilesSync('.'))
  const results = allFiles.filter(file => file.endsWith('.jar'))
  return results.filter((elem, pos) => results.indexOf(elem) === pos)
}
const getAbsolutePath = fm => file => `${fm.target}/${file}`
