'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const auditReport = require('./sample/auditreport.json')

describe('npm audit Module', () => {
  const target = path.join(__dirname, 'sample')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'command').withArgs('npm audit --json').resolves({ stdout: JSON.stringify(auditReport) })
    fm = new FileManager({ target })
  })

  it('should handle node projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should execute npm audit --json', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledOnce
  })

  it('should report low severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.low).to.have.length(1)
    expect(results.low[0]).to.deep.equal({
      code: 'node-npmaudit-4',
      description: 'Found 180 dependencies with low-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report medium severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.have.length(1)
    expect(results.medium[0]).to.deep.equal({
      code: 'node-npmaudit-3',
      description: 'Found 32 dependencies with medium-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report high severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.high).to.have.length(1)
    expect(results.high[0]).to.deep.equal({
      code: 'node-npmaudit-2',
      description: 'Found 5 dependencies with high-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })

  it('should report critical severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.critical).to.have.length(1)
    expect(results.critical[0]).to.deep.equal({
      code: 'node-npmaudit-1',
      description: 'Found 1 dependencies with critical-severity vulnerabilities',
      mitigation: 'Run npm audit for further information',
      offender: 'Vulnerable npm dependency'
    })
  })
})
