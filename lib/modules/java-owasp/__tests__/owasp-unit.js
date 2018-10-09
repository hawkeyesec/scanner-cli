'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const fs = require('fs')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Java OWASP Dependency Checker Module', () => {
  let results, exec
  const sampleReport = fs.readFileSync(path.join(__dirname, './sample/owaspDependencySample.json'), 'utf-8')
  const noIssueReport = fs.readFileSync(path.join(__dirname, './sample/owaspDependencySampleNoIssue.json'), 'utf-8')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null, { stdout: null }),
      commandExists: () => true
    }
  })

  it('should handle maven projects', () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })

    expect(handles({ fm, results, exec })).to.be.true
  })

  it('should handle gradle projects', () => {
    const target = path.join(__dirname, './sample/gradle')
    const fm = new FileManager({ target })

    expect(handles({ fm, results, exec })).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    const target = path.join(__dirname, './sample/gradle')
    const fm = new FileManager({ target })

    expect(handles({ fm, results, exec })).to.be.false
  })

  it('should not run on missing jars', () => {
    const target = path.join(__dirname, './sample/mvn-with-no-jar')
    const fm = new FileManager({ target })

    expect(handles({ fm, results, exec })).to.be.false
  })

  it('should execute dependency check for maven with all required arguments', async () => {
    const target = path.join(__dirname, './sample/maven')
    const buildFolder = 'target'
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs(buildFolder).returns(true)
      .withArgs('dependency-check-report.json').returns(true)
    sinon.spy(exec, 'command')

    await run({ fm, results, exec })

    expect(exec.command.firstCall.args[0]).to.equal(`dependency-check --noupdate --project Testing --format JSON --out . -s ${target}/${buildFolder}/main.jar`)
  })

  it('should execute dependency check for gradle with all required arguments', async () => {
    const target = path.join(__dirname, './sample/gradle')
    const buildFolder = 'build'
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs(buildFolder).returns(true)
      .withArgs('dependency-check-report.json').returns(true)
    sinon.spy(exec, 'command')

    await run({ fm, results, exec })

    expect(exec.command.firstCall.args[0]).to.equal(`dependency-check --noupdate --project Testing --format JSON --out . -s ${target}/${buildFolder}/main.jar`)
  })

  it('should parse issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('dependency-check-report.json').returns(true)

    await run({ fm, results, exec })

    expect(results.medium).to.have.been.called
    expect(results.medium).to.have.been.calledWith({
      code: 'CVE-2013-4499',
      offender: 'mapstruct-1.1.0.Final.jar',
      description: 'https://nvd.nist.gov/vuln/detail/CVE-2013-4499',
      mitigation: 'See the CVE link on the description column.'
    })
  })

  it('should not report when no issues are present', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(noIssueReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('dependency-check-report.json').returns(true)

    await run({ fm, results, exec })

    expect(results.low).to.not.have.been.called
    expect(results.medium).to.not.have.been.called
    expect(results.high).to.not.have.been.called
    expect(results.critical).to.not.have.been.called
  })

  it('should error when dependency check errored', async () => {
    const target = path.join(__dirname, './sample/maven')
    exec.command = (cmd, pwd, cb) => cb(new Error('some error'))
    const fm = new FileManager({ target })
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)

    let hasErrored = false
    try {
      await run({ fm, results, exec })
    } catch (e) {
      hasErrored = true
    }
    expect(hasErrored).to.be.true
  })

  it('should error when no report present ', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('dependency-check-report.json').returns(false)

    let hasErrored = false
    try {
      await run({ fm, results, exec })
    } catch (e) {
      hasErrored = true
    }
    expect(hasErrored).to.be.true
  })
})
