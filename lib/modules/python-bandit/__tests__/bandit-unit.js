'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const FileManager = require('../../../file-manager')
const exec = require('../../../exec')
const { handles, run } = require('..')
const sample = require('./sample/bandit.json')

describe('Python Bandit Module', () => {
  let fm
  const target = path.join(__dirname, './sample')

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: JSON.stringify(sample) })
    fm = new FileManager({ target })
  })

  it('should handle python projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    expect(await handles(fm)).to.be.false
  })

  it('should execute bandit without excludes', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('bandit -r . -f json', { cwd: target })
  })

  it('should execute bandit with excludes', async () => {
    const fm = new FileManager({ target, exclude: [/^ignoredir\//] })
    await run(fm)
    expect(exec.command).to.have.been.calledWith('bandit -r . -f json -x ignoredir/bar.py,ignoredir/foo.py', { cwd: target })
  })

  it('should log high severity issues', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'python-bandit-B201',
      offender: 'app.py lines 43',
      description: 'flask_debug_true B201',
      mitigation: 'A Flask app appears to be run with debug=True, which exposes the Werkzeug debugger and allows the execution of arbitrary code. Review the file and fix the issue.'
    }])
  })

  it('should log low severity issues', async () => {
    const { results } = await run(fm)
    expect(results.low).to.deep.equal([{
      code: 'python-bandit-B101',
      offender: 'somefile.py lines 186',
      description: 'assert_used B101',
      mitigation: 'Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. Review the file and fix the issue.'
    }])
  })

  it('should log medium severity issues', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.deep.equal([{
      code: 'python-bandit-B104',
      offender: 'app.py lines 43',
      description: 'hardcoded_bind_all_interfaces B104',
      mitigation: 'Possible binding to all interfaces. Review the file and fix the issue.'
    }])
  })

  it('should log high severity issues', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'python-bandit-B201',
      offender: 'app.py lines 43',
      description: 'flask_debug_true B201',
      mitigation: 'A Flask app appears to be run with debug=True, which exposes the Werkzeug debugger and allows the execution of arbitrary code. Review the file and fix the issue.'
    }])
  })
})
