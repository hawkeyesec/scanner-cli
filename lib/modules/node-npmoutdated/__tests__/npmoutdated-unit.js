'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const report = require('./sample/outdatedreport.json')

describe('npm outdated Module', () => {
  const target = path.join(__dirname, 'sample')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: JSON.stringify(report) })
    fm = new FileManager({ target })
  })

  it('should handle node projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should execute npm outdated --json', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('npm outdated --json')
  })

  it('should report low severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.low).to.deep.equal([{
      code: 'node-npmoutdated-crossenv-3',
      description: 'Module is one or more patch versions out of date',
      mitigation: 'Upgrade to v0.0.4 (Current: v0.0.2)',
      offender: 'crossenv'
    }])
  })

  it('should report medium severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.deep.equal([{
      code: 'node-npmoutdated-mysqljs-2',
      description: 'Module is one or more minor versions out of date',
      mitigation: 'Upgrade to v0.1.0 (Current: v0.0.2)',
      offender: 'mysqljs'
    }])
  })

  it('should report high severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'node-npmoutdated-async-1',
      description: 'Module is one or more major versions out of date',
      mitigation: 'Upgrade to v3.0.0 (Current: v2.1.2)',
      offender: 'async'
    }])
  })

  it('should not report when things are up to date', async () => {
    exec.command.resolves({ stdout: '' })
    const { results } = await run(fm)
    expect(results.low).to.be.empty
    expect(results.medium).to.be.empty
    expect(results.high).to.be.empty
    expect(results.critical).to.be.empty
  })
})
