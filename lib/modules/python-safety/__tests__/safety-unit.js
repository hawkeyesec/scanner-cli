'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const FileManager = require('../../../fileManager')
const { handles, run } = require('..')

describe('Python safety Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample')
  const sample = fs.readFileSync(path.join(__dirname, './sample/safety.json'), 'utf-8')

  beforeEach(() => {
    results = {
      critical: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null, { stdout: sample }),
      commandExists: () => true
    }
    logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    }
    fm = new FileManager({ target, logger })
    opts = { fm, results, exec, logger }
  })

  it('should handle python projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    expect(handles(opts)).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should execute command', async () => {
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith('safety check --json -r requirements.txt', { cwd: target })
  })

  it('should log unpinned dependencies', async () => {
    await run(opts)
    expect(logger.warn).to.have.been.calledThrice
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'requests\' found, unable to check.')
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'cryptography\' found, unable to check.')
    expect(logger.warn).to.have.been.calledWith('Warning: unpinned requirement \'django\' found, unable to check.')
  })

  it('should log vulns as critical severity issues', async () => {
    await run(opts)
    expect(results.critical).to.have.been.calledWith({
      code: '25853',
      description: 'This is an insecure package with lots of exploitable security vulnerabilities.',
      mitigation: 'Versions <0.2.0 are vulnerable. Update to a non vulnerable version.',
      offender: 'insecure-package 0.1'
    })
  })
})
