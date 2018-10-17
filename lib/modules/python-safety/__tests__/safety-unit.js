'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')
const logger = require('../../../logger')

describe('Python safety Module', () => {
  let fm
  const target = path.join(__dirname, './sample')
  const sample = fs.readFileSync(path.join(__dirname, './sample/safety.json'), 'utf-8')

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: sample })
    fm = new FileManager({ target })
    sinon.spy(logger, 'warn')
  })

  it('should handle python projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    expect(await handles(fm)).to.be.false
  })

  it('should execute command', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('safety check --json -r requirements.txt', { cwd: target })
  })

  it('should log unpinned dependencies', async () => {
    await run(fm)
    expect(logger.warn).to.have.been.calledThrice
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'requests\' found, unable to check.')
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'cryptography\' found, unable to check.')
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'django\' found, unable to check.')
  })

  it('should log vulns as critical severity issues', async () => {
    const { results } = await run(fm)
    expect(results.critical).to.deep.equal([{
      code: 'python-safety-25853',
      description: 'This is an insecure package with lots of exploitable security vulnerabilities.',
      mitigation: 'Versions <0.2.0 are vulnerable. Update to a non vulnerable version.',
      offender: 'insecure-package 0.1'
    }])
  })
})
