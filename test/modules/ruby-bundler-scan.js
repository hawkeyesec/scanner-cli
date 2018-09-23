'use strict'
const BundlerScan = require('../../lib/modules/ruby-bundler-scan')
const FileManager = require('../../lib/fileManager')
const deride = require('deride')
const path = require('path')
const should = require('should')
const fs = require('fs')

describe('Bundler-scan', () => {
  let sample = fs.readFileSync(path.join(__dirname, '../samples/bundlerScan.txt'))

  let bundlerScan, mockExec, mockResults
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists'])
    mockExec.setup.command.toCallbackWith(null, {
      stdout: sample
    })
    mockExec.setup.commandExists.toReturn(true)
    const nullLogger = deride.stub(['log', 'warn', 'debug', 'error'])
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/ruby'),
      logger: nullLogger
    })

    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    bundlerScan = new BundlerScan({
      exec: mockExec,
      logger: nullLogger
    })
    should(bundlerScan.handles(fileManager)).eql(true)
  })

  it('should execute bundler-audit', done => {
    bundlerScan.run(mockResults, () => {
      mockExec.expect.command.called.withArg('bundle-audit')
      done()
    })
  })

  it('should report medium vulnerabilities', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(data.data.criticality.toLowerCase()).eql('medium')
    })
    bundlerScan.run(mockResults, done)
  })

  it('should report high vulnerabilities', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.data.criticality.toLowerCase()).eql('high')
    })
    bundlerScan.run(mockResults, done)
  })

  it('should report insecure gem sources', done => {
    mockResults.setup.low.toDoThis(data => {
      if (data.description === 'Insecure Source URI') { done() }
    })
    bundlerScan.run(mockResults)
  })
})
