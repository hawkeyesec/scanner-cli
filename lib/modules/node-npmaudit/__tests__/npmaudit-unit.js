'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')
const auditReport = require('./sample/auditreport.json')

describe('npm audit Module', () => {
  const target = path.join(__dirname, './sample')
  let fm, results, opts, exec

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: sinon.stub()
    }
    const logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub()
    }
    fm = new FileManager({ target, logger })
    opts = { fm, results, exec }
  })

  it('should handle node projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should execute npm audit --json', async () => {
    exec.command.withArgs('npm audit --json').yields(null, { stdout: JSON.stringify(auditReport) })
    await run(opts)
    expect(exec.command).to.have.been.calledWith('npm audit --json')
  })

  it('should report low severity vulnerabilities', async () => {
    exec.command.withArgs('npm audit --json').yields(null, { stdout: JSON.stringify(auditReport) })
    await run(opts)
    expect(results.low).to.have.been.calledOnce
    expect(results.low).to.have.been.calledWith({
      code: 4,
      description: 'Found 180 dependencies with low-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report medium severity vulnerabilities', async () => {
    exec.command.withArgs('npm audit --json').yields(null, { stdout: JSON.stringify(auditReport) })
    await run(opts)
    expect(results.medium).to.have.been.calledOnce
    expect(results.medium).to.have.been.calledWith({
      code: 3,
      description: 'Found 32 dependencies with medium-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report high severity vulnerabilities', async () => {
    exec.command.withArgs('npm audit --json').yields(null, { stdout: JSON.stringify(auditReport) })
    await run(opts)
    expect(results.high).to.have.been.calledOnce
    expect(results.high).to.have.been.calledWith({
      code: 2,
      description: 'Found 5 dependencies with high-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report critical severity vulnerabilities', async () => {
    exec.command.withArgs('npm audit --json').yields(null, { stdout: JSON.stringify(auditReport) })
    await run(opts)
    expect(results.critical).to.have.been.calledOnce
    expect(results.critical).to.have.been.calledWith({
      code: 1,
      description: 'Found 1 dependencies with critical-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })
})
