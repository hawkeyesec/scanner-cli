'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../fileManager')
const report = require('./sample/outdatedReport.json')

describe('npm outdated Module', () => {
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

  it('should execute npm outdated --json', async () => {
    exec.command.withArgs('npm outdated --json').yields(null, { stdout: JSON.stringify(report) })
    await run(opts)
    expect(exec.command).to.have.been.calledWith('npm outdated --json')
  })

  it('should report low severity vulnerabilities', async () => {
    exec.command.withArgs('npm outdated --json').yields(null, { stdout: JSON.stringify(report) })
    await run(opts)
    expect(results.low).to.have.been.calledOnce
    expect(results.low).to.have.been.calledWith({
      code: 3,
      description: 'Module is one or more patch versions out of date',
      mitigation: 'Upgrade to v0.0.4 (Current: v0.0.2)',
      offender: 'crossenv'
    })
  })

  it('should report medium severity vulnerabilities', async () => {
    exec.command.withArgs('npm outdated --json').yields(null, { stdout: JSON.stringify(report) })
    await run(opts)
    expect(results.medium).to.have.been.calledOnce
    expect(results.medium).to.have.been.calledWith({
      code: 2,
      description: 'Module is one or more minor versions out of date',
      mitigation: 'Upgrade to v0.1.0 (Current: v0.0.2)',
      offender: 'mysqljs'
    })
  })

  it('should report high severity vulnerabilities', async () => {
    exec.command.withArgs('npm outdated --json').yields(null, { stdout: JSON.stringify(report) })
    await run(opts)
    expect(results.high).to.have.been.calledOnce
    expect(results.high).to.have.been.calledWith({
      code: 1,
      description: 'Module is one or more major versions out of date',
      mitigation: 'Upgrade to v3.0.0 (Current: v2.1.2)',
      offender: 'async'
    })
  })

  it('should not report when things are up to date', async () => {
    exec.command.withArgs('npm outdated --json').yields(null, { stdout: '' })
    await run(opts)
    expect(results.low).to.not.have.been.called
    expect(results.medium).to.not.have.been.called
    expect(results.high).to.not.have.been.called
    expect(results.critical).to.not.have.been.called
  })
})
