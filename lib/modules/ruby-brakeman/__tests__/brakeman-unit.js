'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Python piprot Module', () => {
  let results, exec, fm, opts
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
    fm = new FileManager({ target })
    opts = { fm, results, exec }
  })

  it('should handle rails projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    expect(handles(opts)).to.be.false
  })

  it('should not run on missing app folder', () => {
    const target = path.join(__dirname, './sample/without-app')
    const fm = new FileManager({ target })

    expect(handles({ fm, results, exec })).to.be.false
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
    const fm = new FileManager({ target })
    const spy = sinon.spy(run)
    try { await run({ fm, results, exec }) } catch (e) {}
    expect(spy).to.have.thrown
  })
})
