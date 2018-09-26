'use strict'
const PythonOutdatedDep = require('../../lib/modules/python-piprot')
const FileManager = require('../../lib/fileManager')
const deride = require('deride')
const path = require('path')
const should = require('should')
const fs = require('fs')

describe('PythonOutdatedDep', () => {
  const sample = fs.readFileSync(path.join(__dirname, '../samples/piprot.txt'), 'utf8')

  let pythonOutdatedDep, mockExec, mockResults, fileManager
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists'])
    mockExec.setup.command.toCallbackWith(null, {
      stdout: sample
    })
    mockExec.setup.commandExists.toReturn(true)

    const nullLogger = deride.stub(['log', 'debug', 'error'])
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/python'),
      logger: nullLogger
    })
    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    pythonOutdatedDep = new PythonOutdatedDep({
      exec: mockExec
    })
    should(pythonOutdatedDep.handles(fileManager)).eql(true)
  })

  it('should execute piprot -o', done => {
    pythonOutdatedDep.run(mockResults, () => {
      mockExec.expect.command.called.withArg('piprot -o')
      done()
    })
  })

  it('should log major version changes as high', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.offender).eql('cryptography')
      should(data.mitigation).eql('Update to 2.1.2')
      should(data.description).eql('Module is one or more major versions out of date')
      should(data.code).eql(1)
    })
    pythonOutdatedDep.run(mockResults, done)
  })

  it('should log minor version changes as medium', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(data.offender).eql('pytest')
      should(data.mitigation).eql('Update to 3.2.3')
      should(data.description).eql('Module is one or more minor versions out of date')
      should(data.code).eql(2)
    })
    pythonOutdatedDep.run(mockResults, done)
  })

  it('should log patch version changes as low', done => {
    pythonOutdatedDep.run(mockResults, () => {
      const item = {
        code: 3,
        offender: 'email_validator',
        description: 'Module is one or more patch versions out of date',
        mitigation: 'Update to 1.0.3'
      }

      mockResults.expect.low.called.withArgs(item)
      done()
    })
  })

  it('should log not valid versions as low', done => {
    pythonOutdatedDep.run(mockResults, () => {
      const item = {
        code: 3,
        offender: 'psycopg2',
        description: 'Module is one or more patch versions out of date',
        mitigation: 'Update to 2.7.3.2'
      }

      mockResults.expect.low.called.withArgs(item)
      done()
    })
  })

  it('should not run piprot if not installed', done => {
    const mockExec = deride.stub(['commandExists'])
    const mockLogger = deride.stub(['warn'])
    mockExec.setup.commandExists.toReturn(false)

    const pythonOutdatedDep = new PythonOutdatedDep({
      exec: mockExec,
      logger: mockLogger
    })

    should(pythonOutdatedDep.handles(fileManager)).eql(false)
    mockLogger.expect.warn.called.withArgs('requirements.txt found but piprot not found in $PATH')
    mockLogger.expect.warn.called.withArgs('python-piprot will not run unless you install piprot')
    mockLogger.expect.warn.called.withArgs('Please see: https://github.com/sesh/piprot')
    done()
  })
})
