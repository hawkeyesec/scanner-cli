'use strict'

/* eslint-disable no-unused-expressions */

const fs = require('fs')
const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Ruby Bundler Module', () => {
  const target = path.join(__dirname, './sample')
  const sample = fs.readFileSync(path.join(__dirname, './sample/bundler.txt'), 'utf-8')
  let fm

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command')
    exec.command.withArgs('bundle-audit update').resolves()
    exec.command.withArgs('bundle-audit', { cwd: target }).resolves({ stdout: sample })
    fm = new FileManager({ target })
  })

  it('should handle ruby projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    expect(await handles(fm)).to.be.false
  })

  it('should execute command', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledTwice
  })

  it('should log high severity issues', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'ruby-bundler-scan-cve-2013-0156',
      description: 'Ruby on Rails params_parser.rb Action Pack Type Casting Parameter Parsing Remote Code Execution',
      mitigation: 'http://osvdb.org/show/osvdb/89026',
      offender: 'actionpack'
    }])
  })

  it('should log medium severity issues', async () => {
    const { results } = await run(fm)
    expect(results.medium).to.deep.equal([{
      code: 'ruby-bundler-scan-cve-2014-0130',
      description: 'Directory Traversal Vulnerability With Certain Route Configurations',
      mitigation: 'https://groups.google.com/forum/#!topic/rubyonrails-security/NkKc7vTW70o',
      offender: 'actionpack'
    }])
  })
})
