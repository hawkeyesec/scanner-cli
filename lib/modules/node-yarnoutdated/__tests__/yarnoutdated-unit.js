'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const fs = require('fs')
const { handles, run } = require('..')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')

describe('yarn outdated Module', () => {
  const sample = fs.readFileSync(path.join(__dirname, './sample/outdatedreport'), 'utf-8')
  const target = path.join(__dirname, 'sample')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: sample })
    fm = new FileManager({ target })
  })

  it('should handle node projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should execute yarn outdated --json', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('yarn outdated --json')
  })

  it('should report patch version outdated packages', async () => {
    const { results } = await run(fm)
    expect(results.low).to.deep.equal([{
      'code': 'node-yarnoutdated-chai-3',
      'description': 'Module is one or more patch versions out of date',
      'mitigation': 'Upgrade to v4.1.2 (Current: v4.1.1)',
      'offender': 'chai'
    }])
  })

  it('should report minor version outdated packages', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.deep.equal([{
      'code': 'node-yarnoutdated-async-2',
      'description': 'Module is one or more minor versions out of date',
      'mitigation': 'Upgrade to v2.6.1 (Current: v2.1.5)',
      'offender': 'async'
    }])
  })

  it('should report major version outdated packages', () => {
    return run(fm).then(({ results }) => {
      expect(results.high).to.deep.equal([{
        'code': 'node-yarnoutdated-mocha-1',
        'description': 'Module is one or more major versions out of date',
        'mitigation': 'Upgrade to v5.2.0 (Current: v4.1.0)',
        'offender': 'mocha'
      }])
    })
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
