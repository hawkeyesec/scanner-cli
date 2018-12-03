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
    sinon.stub(exec, 'exists').resolves(true)
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
    expect(results.low).to.have.length(3)
    expect(results.low[0]).to.deep.equal({
      'code': 'node-npmaudit-debug-534',
      'description': 'Regular Expression Denial of Service',
      'mitigation': 'Ingested via babel-core, babel-preset-es2015, webpack',
      'offender': 'debug'
    })
  })

  it('should report medium severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.have.length(4)
    expect(results.medium[0]).to.deep.equal({
      'code': 'node-npmaudit-hoek-566',
      'description': 'Prototype pollution',
      'mitigation': 'Ingested via node-sass, request, webpack',
      'offender': 'hoek'
    })
  })

  it('should report high severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.high).to.have.length(2)
    expect(results.high[1]).to.deep.equal({
      'code': 'node-npmaudit-sshpk-606',
      'description': 'Regular Expression Denial of Service',
      'mitigation': 'Ingested via node-sass, request, webpack',
      'offender': 'sshpk'
    })
  })

  it('should report critical severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.critical).to.have.length(1)
    expect(results.critical[0]).to.deep.equal({
      'code': 'node-npmaudit-macaddress-654',
      'description': 'Command Injection',
      'mitigation': 'Ingested via css-loader',
      'offender': 'macaddress'
    })
  })
})
