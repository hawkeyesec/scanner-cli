'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Python piprot Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample')
  const sample = fs.readFileSync(path.join(__dirname, './sample/piprot.txt'), 'utf-8')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
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

  it('should execute piprot', async () => {
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith('piprot -o', { cwd: target })
  })

  it('should log low severity issues', async () => {
    await run(opts)
    expect(results.low).to.have.been.calledWith({
      code: 3,
      description: 'Module is one or more patch versions out of date',
      mitigation: 'Upgrade to v1.0.3 (Current: v1.0.2)',
      offender: 'email_validator'
    })
  })

  it('should log medium severity issues', async () => {
    await run(opts)
    expect(results.medium).to.have.been.calledWith({
      code: 2,
      description: 'Module is one or more minor versions out of date',
      mitigation: 'Upgrade to v3.2.3 (Current: v3.0.7)',
      offender: 'pytest'
    })
  })

  it('should log high severity issues', async () => {
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 1,
      description: 'Module is one or more major versions out of date',
      mitigation: 'Upgrade to v2.1.2 (Current: v1.8.1)',
      offender: 'cryptography'
    })
  })
})
