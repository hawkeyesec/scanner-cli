'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const { handles, run } = require('..')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')

describe('yarn audit Module', () => {
  const sample = fs.readFileSync(path.join(__dirname, './sample/auditreport'), 'utf-8')
  const target = path.join(__dirname, 'sample')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').withArgs('yarn audit --json').resolves({ stdout: sample })
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
    expect(results.low).to.have.length(9)
    expect(results.low[0]).to.deep.equal({
      'code': 'node-yarnaudit-debug-534',
      'description': 'Regular Expression Denial of Service',
      'mitigation': 'Ingested via body-parser, debug, express, morgan',
      'offender': 'debug'
    })
  })

  it('should report medium severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.have.length(4)
    expect(results.medium[0]).to.deep.equal({
      'code': 'node-yarnaudit-mime-535',
      'description': 'Regular Expression Denial of Service',
      'mitigation': 'Ingested via express',
      'offender': 'mime'
    })
  })

  it('should report high severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.high).to.have.length(5)
    expect(results.high[1]).to.deep.equal({
      'code': 'node-yarnaudit-fresh-526',
      'description': 'Regular Expression Denial of Service',
      'mitigation': 'Ingested via express, serve-favicon',
      'offender': 'fresh'
    })
  })

  it('should report critical severity vulnerabilities', async () => {
    const { results } = await run(fm)
    expect(results.critical).to.have.length(1)
    expect(results.critical[0]).to.deep.equal({
      'code': 'node-yarnaudit-hoek-566',
      'description': 'Prototype pollution',
      'mitigation': 'Ingested via jsonwebtoken',
      'offender': 'hoek'
    })
  })
})
