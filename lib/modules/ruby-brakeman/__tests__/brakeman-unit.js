'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const FileManager = require('../../../fileManager')
const { handles, run } = require('..')

describe('Python piprot Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample/with-app')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null),
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

  it('should handle rails projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    expect(handles(opts)).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should not run on missing app folder', () => {
    const target = path.join(__dirname, './sample/without-app')
    const fm = new FileManager({ target, logger })

    expect(handles({ fm, results, exec, logger })).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should execute command', async () => {
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith(`brakeman . -f json -o ${target}/output.json`, { cwd: target })
  })

  it('should log high severity issues', async () => {
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 'SQL',
      offender: 'app/controllers/application_controller.rb',
      description: 'Possible SQL injection (http://brakemanscanner.org/docs/warning_types/sql_injection/)',
      mitigation: 'Check line 11'
    })
  })

  it('should error when output was not created', async () => {
    const target = path.join(__dirname, './sample/without-app')
    const fm = new FileManager({ target, logger })
    const spy = sinon.spy(run)
    try { await run({ fm, results, exec, logger }) } catch (e) {}
    expect(spy).to.have.thrown
  })
})
