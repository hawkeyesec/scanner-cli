'use strict'

const path = require('path')
const { promisify } = require('util')
const _ = require('lodash')
const xml2js = require('xml2js')
const ModuleResults = require('../../results')
const exec = require('../../exec')
const logger = require('../../logger')

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Finds common security issues in Java code with findsecbugs',
  enabled: true,
  handles: async fm => {
    const isJavaProject = fm.all().some(file => file.endsWith('.java'))
    const hasJarFiles = getProjectJars(fm).length > 0
    const exists = await exec.exists('findsecbugs')

    if (isJavaProject && !hasJarFiles) {
      logger.warn('java files were found but no jar files')
      logger.warn(`${key} scan will not run unless you build the project before`)
      return false
    }

    if (isJavaProject && hasJarFiles && !exists) {
      logger.warn('java files found but findSecBugs was not found in $PATH')
      logger.warn(`${key} scan will not run unless you install findSecBugs CLI`)
      logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/java-find-secbugs/README.md')
      return false
    }

    return isJavaProject && hasJarFiles
  },
  run: async fm => {
    const jarFiles = getProjectJars(fm).map(getAbsolutePath(fm)).join(' ')
    const cmd = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fm.target}/findSecBugsReport.xml ${jarFiles}`
    const { stdout: executablePath } = await exec.command(`which findsecbugs`)
    const cwd = executablePath.substring(0, executablePath.lastIndexOf('/'))
    const data = await exec.command(cmd, { cwd })
    if (!fm.exists('findSecBugsReport.xml')) {
      throw new Error(`The findsecbugs report was not created: ${JSON.stringify(data.stderr)}`)
    }

    const parser = new xml2js.Parser()
    const report = fm.readFileSync('findSecBugsReport.xml')
    const findSecBugsResult = await promisify(parser.parseString)(report)
    const bugs = _.get(findSecBugsResult, ['BugCollection', 'BugInstance'], [])
    return bugs.map(bug => ({
      level: getSeverity(bug.$.priority),
      code: bug.$.type,
      offender: bug.Method[0].Message[0],
      description: bug.LongMessage[0],
      mitigation: getMitigationMessage(bug.SourceLine)
    })).reduce((results, res) => results[res.level](res), new ModuleResults(key))
  }
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

const getSourceLineRange = line => (line.$.start === line.$.end) ? `${line.$.start}` : `[${line.$.start}-${line.$.end}]`
const getSourceLinesRanges = line => line.map(getSourceLineRange).join(', ')
const getMitigationMessage = line => `Check line(s) ${getSourceLinesRanges(line)}`
const getAbsolutePath = fm => file => `${fm.target}/${file}`
