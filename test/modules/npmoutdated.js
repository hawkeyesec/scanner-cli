'use strict'

const { join } = require('path')
const deride = require('deride')
const should = require('should')
const NpmOutdated = require('../../lib/modules/node-npmoutdated')
const FileManager = require('../../lib/fileManager')
const report = require('../samples/nodejs/outdatedreport.json')

describe('npm audit', () => {
  let npmOutdated, mockExec, mockResults
  beforeEach(() => {
    mockExec = deride.stub(['command'])
    mockExec.setup.command.toCallbackWith(null, { stdout: JSON.stringify(report) })
    const nullLogger = deride.stub(['log', 'debug', 'error'])
    const fileManager = new FileManager({
      target: join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    })

    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    npmOutdated = new NpmOutdated({ exec: mockExec })
    should(npmOutdated.handles(fileManager)).eql(true)
  })

  it('should execute npm outdated --json', done => {
    npmOutdated.run(mockResults, () => {
      mockExec.expect.command.called.withArg('npm outdated --json')
      done()
    })
  })

  it('should log major version changes as high', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.offender).eql('async')
      should(data.description).eql('Module is one or more major versions out of date')
      should(data.mitigation).eql('Upgrade to v3.0.0 (Current: v2.1.2)')
    })
    npmOutdated.run(mockResults, done)
  })

  it('should log minor version changes as medium', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(data.offender).eql('mysqljs')
      should(data.description).eql('Module is one or more minor versions out of date')
      should(data.mitigation).eql('Upgrade to v0.1.0 (Current: v0.0.2)')
    })
    npmOutdated.run(mockResults, done)
  })

  it('should log patch version changes as low', done => {
    mockResults.setup.low.toDoThis(data => {
      should(data.offender).eql('crossenv')
      should(data.description).eql('Module is one or more patch versions out of date')
      should(data.mitigation).eql('Upgrade to v0.0.4 (Current: v0.0.2)')
    })
    npmOutdated.run(mockResults, done)
  })
})
