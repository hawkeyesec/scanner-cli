'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const fs = require('fs')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('Java OWASP Dependency Checker Module', () => {
  const sampleReport = fs.readFileSync(path.join(__dirname, './sample/owaspDependencySample.json'), 'utf-8')
  const noIssueReport = fs.readFileSync(path.join(__dirname, './sample/owaspDependencySampleNoIssue.json'), 'utf-8')

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: '' })
  })

  it('should handle maven projects', async () => {
    const fm = new FileManager({ target: path.join(__dirname, './sample/maven') })
    expect(await handles(fm)).to.be.true
  })

  it('should handle gradle projects', async () => {
    const fm = new FileManager({ target: path.join(__dirname, './sample/gradle') })
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    const fm = new FileManager({ target: path.join(__dirname, './sample/gradle') })
    expect(await handles(fm)).to.be.false
  })

  it('should not run on missing jars', async () => {
    const fm = new FileManager({ target: path.join(__dirname, './sample/mvn-with-no-jar') })
    expect(await handles(fm)).to.be.false
  })

  it('should execute dependency check for maven with all required arguments', async () => {
    const target = path.join(__dirname, './sample/maven')
    const buildFolder = 'target'
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs(buildFolder).returns(true)
      .withArgs('dependency-check-report.json').returns(true)

    await run(fm)

    expect(exec.command.firstCall.args[0]).to.equal(`dependency-check --project Testing --format JSON --out . -s ${target}/${buildFolder}/main.jar`)
    expect(exec.command.firstCall.args[1]).to.deep.equal({ cwd: target })
  })

  it('should execute dependency check for gradle with all required arguments', async () => {
    const target = path.join(__dirname, './sample/gradle')
    const buildFolder = 'build'
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs(buildFolder).returns(true)
      .withArgs('dependency-check-report.json').returns(true)

    await run(fm)

    expect(exec.command.firstCall.args[0]).to.equal(`dependency-check --project Testing --format JSON --out . -s ${target}/${buildFolder}/main.jar`)
    expect(exec.command.firstCall.args[1]).to.deep.equal({ cwd: target })
  })

  it('should parse issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('dependency-check-report.json').returns(true)

    const { results } = await run(fm)

    expect(results.medium).to.deep.contain({
      code: 'java-owasp-CVE-2013-4499',
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

    const { results } = await run(fm)

    expect(results.low).to.be.empty
    expect(results.medium).to.be.empty
    expect(results.high).to.be.empty
    expect(results.critical).to.be.empty
  })

  it('should error when dependency check errored', () => {
    const target = path.join(__dirname, './sample/maven')
    exec.command = (cmd, pwd, cb) => cb(new Error('some error'))
    const fm = new FileManager({ target })
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)

    return expect(run(fm)).to.be.rejectedWith(Error)
  })

  it('should error when no report present ', () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('dependency-check-report.json').returns(false)

    return expect(run(fm)).to.be.rejectedWith(Error)
  })
})
