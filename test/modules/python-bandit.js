'use strict'
const Bandit = require('../../lib/modules/python-bandit')
const FileManager = require('../../lib/fileManager')
const deride = require('deride')
const path = require('path')
const should = require('should')

describe('Bandit', () => {
  let sample = require('../samples/bandit.json')

  let bandit, mockExec, mockResults, fileManager
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists'])
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    })
    mockExec.setup.commandExists.toReturn(true)

    const nullLogger = deride.stub(['log', 'debug', 'error'])
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/python'),
      logger: nullLogger
    })
    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    bandit = new Bandit({
      exec: mockExec
    })
    should(bandit.handles(fileManager)).eql(true)
  })

  it('should execute bandit -r . -f json', done => {
    bandit.run(mockResults, () => {
      mockExec.expect.command.called.withArg('bandit -r . -f json')
      done()
    })
  })

  it('should log issues with HIGH severity as high', done => {
    bandit.run(mockResults, () => {
      const item = {
        code: 'B201',
        offender: 'app.py lines 43',
        description: 'flask_debug_true B201',
        mitigation: 'A Flask app appears to be run with debug=True, which exposes the Werkzeug debugger and allows the execution of arbitrary code. Review the file and fix the issue.'
      }

      mockResults.expect.high.called.withArgs(item)
      done()
    })
  })

  it('should log issues with MEDIUM severity as medium', done => {
    bandit.run(mockResults, () => {
      const item = {
        code: 'B104',
        offender: 'app.py lines 43',
        description: 'hardcoded_bind_all_interfaces B104',
        mitigation: 'Possible binding to all interfaces. Review the file and fix the issue.'
      }

      mockResults.expect.medium.called.withArgs(item)
      done()
    })
  })

  it('should log issues with LOW severity as low', done => {
    bandit.run(mockResults, () => {
      const item = {
        code: 'B101',
        offender: 'somefile.py lines 186',
        description: 'assert_used B101',
        mitigation: 'Use of assert detected. The enclosed code will be removed when compiling to optimised byte code. Review the file and fix the issue.'
      }

      mockResults.expect.low.called.withArgs(item)
      done()
    })
  })

  it('should not run bandit if not installed', done => {
    const mockExec = deride.stub(['commandExists'])
    const mockLogger = deride.stub(['warn'])
    mockExec.setup.commandExists.toReturn(false)

    const bandit = new Bandit({
      exec: mockExec,
      logger: mockLogger
    })

    should(bandit.handles(fileManager)).eql(false)
    mockLogger.expect.warn.called.withArgs('requirements.txt found but bandit was not found in $PATH')
    mockLogger.expect.warn.called.withArgs('python-bandit will not run unless you install bandit')
    mockLogger.expect.warn.called.withArgs('Please see: https://github.com/openstack/bandit')
    done()
  })
})
