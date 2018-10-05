'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const FileManager = require('../../../fileManager')
const { handles, run } = require('..')

const sample = require('./sample/bandit.json')

describe('Python Bandit Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null, { stdout: JSON.stringify(sample) }),
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

  it('should execute bandit without excludes', async () => {
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith('bandit -r . -f json', { cwd: target })
  })

  it('should execute bandit with excludes', async () => {
    opts.fm = new FileManager({ target, logger, exclude: ['ignoredir'] })
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith('bandit -r . -f json -x ignoredir/bar.py,ignoredir/foo.py', { cwd: target })
  })

  it('should log high severity issues', async () => {
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 'B201',
      offender: 'app.py lines 43',
      description: 'flask_debug_true B201',
      mitigation: 'A Flask app appears to be run with debug=True, which exposes the Werkzeug debugger and allows the execution of arbitrary code. Review the file and fix the issue.'
    })
  })

  it('should log low severity issues', async () => {
    await run(opts)
    expect(results.low).to.have.been.calledWith({
      code: 'B101',
      offender: 'somefile.py lines 186',
      description: 'assert_used B101',
      mitigation: 'Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. Review the file and fix the issue.'
    })
  })

  it('should log medium severity issues', async () => {
    await run(opts)
    expect(results.medium).to.have.been.calledWith({
      code: 'B104',
      offender: 'app.py lines 43',
      description: 'hardcoded_bind_all_interfaces B104',
      mitigation: 'Possible binding to all interfaces. Review the file and fix the issue.'
    })
  })

  it('should log high severity issues', async () => {
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 'B201',
      offender: 'app.py lines 43',
      description: 'flask_debug_true B201',
      mitigation: 'A Flask app appears to be run with debug=True, which exposes the Werkzeug debugger and allows the execution of arbitrary code. Review the file and fix the issue.'
    })
  })
})
