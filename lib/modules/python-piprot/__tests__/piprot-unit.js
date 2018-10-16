'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Python piprot Module', () => {
  const target = path.join(__dirname, './sample')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: fs.readFileSync(path.join(__dirname, './sample/piprot.txt'), 'utf-8') })
    fm = new FileManager({ target })
  })

  it('should handle python projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    expect(await handles(fm)).to.be.false
  })

  it('should execute piprot', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('piprot -o', { cwd: target })
  })

  it('should log low severity issues', async () => {
    const { results } = await run(fm)
    expect(results.low).to.deep.equal([{
      code: 'python-piprot-3',
      description: 'Module is one or more patch versions out of date',
      mitigation: 'Upgrade to v1.0.3 (Current: v1.0.2)',
      offender: 'email_validator'
    }])
  })

  it('should log medium severity issues', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.deep.equal([{
      code: 'python-piprot-2',
      description: 'Module is one or more minor versions out of date',
      mitigation: 'Upgrade to v3.2.3 (Current: v3.0.7)',
      offender: 'pytest'
    }])
  })

  it('should log high severity issues', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'python-piprot-1',
      description: 'Module is one or more major versions out of date',
      mitigation: 'Upgrade to v2.1.2 (Current: v1.8.1)',
      offender: 'cryptography'
    }])
  })
})
