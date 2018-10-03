'use strict'
const util = require('../../util')
const xml2js = require('xml2js')
const Exec = require('../../exec')

module.exports = {
  key: 'java-find-secbugs',
  name: 'FindSecBugs Scan',
  description: 'FindSecBugs find common security issues in Java code.',
  enabled: true,
  handles: ({ fm, logger, exec }) => {
    const isJavaProject = fm.all().some(file => file.endsWith('.java'))
    const hasJarFiles = getProjectJars(fm).length > 0
    const isCompiledJavaProject = isJavaProject && hasJarFiles

    if (isJavaProject && !hasJarFiles) {
      logger.warn('java files were found but no jar files')
      logger.warn(`java-find-secbugs scan will not run unless you build the project before`)
      return false
    }

    if (isCompiledJavaProject && !exec.commandExists('findsecbugs')) {
      logger.warn('java files found but findSecBugs was not found in $PATH')
      logger.warn(`java-find-secbugs scan will not run unless you install findSecBugs CLI`)
      logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/findsecbugs/README.md')
      return false
    }

    return isCompiledJavaProject
  },
  run: ({ fm, exec = new Exec(), results, logger }) => new Promise(function (resolve, reject) {
    const jarFiles = getProjectJars(fm).map(getAbsolutePath(fm)).join(' ')
    const findSecBugsCommand = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fm.target}/findSecBugsReport.xml ${jarFiles}`
    const findSecBugsExecutableLocation = exec.commandSync(`which findsecbugs`).stdout
    const findSecBugsPath = getFindSecBugsPath(findSecBugsExecutableLocation)

    exec.command(findSecBugsCommand, { cwd: findSecBugsPath }, (err, data) => {
      if (err) {
        return reject(new Error(`There was an error while executing FindSecBugs: ${err}`))
      }

      if (!fm.exists('findSecBugsReport.xml')) {
        return reject(new Error(`There was an error while executing FindSecBugs and the report was not created: ${JSON.stringify(data.stderr)}`))
      }

      const parser = new xml2js.Parser()
      const report = fm.readFileSync('findSecBugsReport.xml')

      parser.parseString(report, (_, findSecBugsResult) => {
        const bugs = util.defaultValue(findSecBugsResult.BugCollection.BugInstance, [])

        bugs.forEach(bug => {
          const item = {
            code: bug.$.type,
            offender: bug.Method[0].Message[0],
            description: bug.LongMessage[0],
            mitigation: getMitigationMessage(bug.SourceLine)
          }

          const level = getSeverity(bug.$.priority)
          results[level](item)
        })
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
  return allFiles.filter(file => file.endsWith('.jar'))
}
const getSeverity = priority => {
  switch (priority) {
    case '1': return 'high'
    case '2': return 'medium'
    default: return 'low'
  }
}

const getSourceLineRange = sourceLine => (sourceLine.$.start === sourceLine.$.end)
  ? `${sourceLine.$.start}`
  : `[${sourceLine.$.start}-${sourceLine.$.end}]`
const getSourceLinesRanges = sourceLines => sourceLines.map(getSourceLineRange).join(', ')
const getMitigationMessage = sourceLines => `Check line(s) ${getSourceLinesRanges(sourceLines)}`
const getFindSecBugsPath = findSecBugsExecutableLocation => findSecBugsExecutableLocation.substring(0, findSecBugsExecutableLocation.lastIndexOf('/'))
const getAbsolutePath = fm => file => `${fm.target}/${file}`
