'use strict'

const { join } = require('path')
const deride = require('deride')
const should = require('should')
const NpmAudit = require('../../lib/modules/node-npmaudit')
const FileManager = require('../../lib/fileManager')
const auditReport = require('../samples/nodejs/auditreport.json')

describe('npm audit', () => {
  const offender = 'Vulnerable npm dependency'
  const mitigation = 'Run npm audit for further information'

  let npmAudit, mockExec, mockResults
  beforeEach(() => {
    mockExec = deride.stub(['command'])
    mockExec.setup.command.toCallbackWith(null, { stdout: JSON.stringify(auditReport) })
    const nullLogger = deride.stub(['log', 'debug', 'error'])
    const fileManager = new FileManager({
      target: join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    })

    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    npmAudit = new NpmAudit({ exec: mockExec })
    should(npmAudit.handles(fileManager)).eql(true)
  })

  it('should execute npm audit --json', done => {
    npmAudit.run(mockResults, () => {
      mockExec.expect.command.called.withArg('npm audit --json')
      done()
    })
  })

  it('should report low severity vulnerabilities', done => {
    mockResults.setup.low.toDoThis(data => {
      should(data.offender).eql(offender)
      should(data.mitigation).eql(mitigation)
      should(data.code).eql(4)
      should(data.description).eql('Found 180 dependencies with low-severity vulnerabilities')
    })
    npmAudit.run(mockResults, done)
  })

  it('should report medium severity vulnerabilities', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(data.offender).eql(offender)
      should(data.mitigation).eql(mitigation)
      should(data.code).eql(3)
      should(data.description).eql('Found 32 dependencies with medium-severity vulnerabilities')
    })
    npmAudit.run(mockResults, done)
  })

  it('should report high severity vulnerabilities', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.offender).eql(offender)
      should(data.mitigation).eql(mitigation)
      should(data.code).eql(2)
      should(data.description).eql('Found 5 dependencies with high-severity vulnerabilities')
    })
    npmAudit.run(mockResults, done)
  })

  it('should report critical severity vulnerabilities', done => {
    mockResults.setup.critical.toDoThis(data => {
      should(data.offender).eql(offender)
      should(data.mitigation).eql(mitigation)
      should(data.code).eql(1)
      should(data.description).eql('Found 1 dependencies with critical-severity vulnerabilities')
    })
    npmAudit.run(mockResults, done)
  })
})
