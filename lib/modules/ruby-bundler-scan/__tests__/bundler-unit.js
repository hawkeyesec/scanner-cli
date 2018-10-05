'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const FileManager = require('../../../fileManager')
const { handles, run } = require('..')

describe('Ruby Bundler Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample')
  const sample = fs.readFileSync(path.join(__dirname, './sample/bundler.txt'), 'utf-8')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: sinon.stub(),
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

  it('should handle ruby projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    expect(handles(opts)).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should execute command', async () => {
    exec.command.withArgs('bundle-audit update', null).yields()
    exec.command.withArgs('bundle-audit', { cwd: target }).yields(null, { stdout: sample })
    await run(opts)
    expect(exec.command).to.have.been.calledTwice
  })

  it('should log high severity issues', async () => {
    exec.command.withArgs('bundle-audit update', null).yields()
    exec.command.withArgs('bundle-audit', { cwd: target }).yields(null, { stdout: sample })
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 'cve-2013-0156',
      description: 'Ruby on Rails params_parser.rb Action Pack Type Casting Parameter Parsing Remote Code Execution',
      mitigation: 'http://osvdb.org/show/osvdb/89026',
      offender: 'actionpack'
    })
  })

  it('should log medium severity issues', async () => {
    exec.command.withArgs('bundle-audit update', null).yields()
    exec.command.withArgs('bundle-audit', { cwd: target }).yields(null, { stdout: sample })
    await run(opts)
    expect(results.medium).to.have.been.calledWith({
      code: 'cve-2014-0130',
      description: 'Directory Traversal Vulnerability With Certain Route Configurations',
      mitigation: 'https://groups.google.com/forum/#!topic/rubyonrails-security/NkKc7vTW70o',
      offender: 'actionpack'
    })
  })
})
