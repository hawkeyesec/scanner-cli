'use strict'

const Exec = require('../../exec')

module.exports = {
  key: 'java-owasp',
  name: 'Owasp Dependency Check Scan',
  description: 'Scan the dependencies of a Java project.',
  enabled: true,
  handles: ({ fm, logger, exec }) => {
    const isJavaProject = fm.all().some(file => file.endsWith('.java'))
    const hasJarFiles = getProjectJars(fm).length > 0

    if (isJavaProject && !hasJarFiles) {
      logger.warn('java files were found but no jar files')
      logger.warn(`java-owasp scan will not run unless you build the project before`)
      return false
    }

    if (isJavaProject && hasJarFiles && !exec.commandExists('dependency-check')) {
      logger.warn('java files found but dependency-check was not found in $PATH')
      logger.warn(`java-owasp scan will not run unless you install Owasp Dependency Check CLI`)
      logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/owaspDependencyCheck/README.md')
      return false
    }
    return isJavaProject && hasJarFiles
  },
  run: ({ fm, exec = new Exec(), results, logger }) => new Promise(function (resolve, reject) {
    const jarFiles = getProjectJars(fm).map(getAbsolutePath(fm)).join(' -s ')
    const owaspCheckCommand = `dependency-check --noupdate --project Testing --format JSON --out . -s ${jarFiles}`
    exec.command(owaspCheckCommand, {}, (err, data) => {
      if (err) {
        return reject(new Error(`There was an error while executing Owasp Dependency Check: ${err}`))
      }

      if (!fm.exists('dependency-check-report.json')) {
        return reject(new Error(`There was an error while executing Owasp Dependency Check and the report was not created: ${JSON.stringify(data.stderr)}`))
      }

      const report = fm.readFileSync('dependency-check-report.json')
      const parsedReport = JSON.parse(report)
      const dependencies = parsedReport.dependencies

      dependencies.forEach(dependency => {
        if (dependency.vulnerabilities !== undefined) {
          dependency.vulnerabilities.forEach(vulnerability => {
            const offenderIndex = dependency.fileName.indexOf(' ')
            const offender = dependency.fileName.slice(offenderIndex).trim()

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

      resolve()
    })
  })

}
const getProjectJars = (fm) => {
  const mavenTargetFolder = 'target'
  const gradleBuildFolder = 'build'
  let allFiles = []

  if (fm.exists(mavenTargetFolder)) {
    allFiles = allFiles.concat(fm.getAllFilesSync(mavenTargetFolder))
  }

  if (fm.exists(gradleBuildFolder)) {
    allFiles = allFiles.concat(fm.getAllFilesSync(gradleBuildFolder))
  }

  allFiles = allFiles.concat(fm.getAllFilesSync('.'))
  const results = allFiles.filter(file => file.endsWith('.jar'))
  return results.filter((elem, pos) => results.indexOf(elem) === pos)
}
const getAbsolutePath = fm => file => `${fm.target}/${file}`
