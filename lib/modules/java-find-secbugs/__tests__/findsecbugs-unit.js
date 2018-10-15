'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const fs = require('fs')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('FindSecBugs Module', () => {
  const sampleReport = fs.readFileSync(path.join(__dirname, './sample/findSecBugsReport.xml'), 'utf-8')

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: '' })
  })

  it('should handle maven projects', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should handle gradle projects', async () => {
    const target = path.join(__dirname, './sample/gradle')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    const target = path.join(__dirname, './sample/gradle')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.false
  })

  it('should not run on missing jars', async () => {
    const target = path.join(__dirname, './sample/mvn-with-no-jar')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.false
  })

  it('should execute findsecbugs with all required arguments', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    await run(fm)

    expect(exec.command.firstCall.args[0]).to.equal(`which findsecbugs`)
    expect(exec.command.secondCall.args[0]).to.equal(`findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${target}/findSecBugsReport.xml ${target}/target/main.jar`)
  })

  it('should parse high priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    const results = await run(fm)

    expect(results.results.high).to.deep.equal([{
      code: 'java-find-secbugs-XML_DECODER',
      offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
      description: 'It is not safe to use an XMLDecoder to parse user supplied data',
      mitigation: 'Check line(s) [47-48]'
    }])
  })

  it('should parse medium priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    const results = await run(fm)

    expect(results.results.medium).to.deep.equal([{
      code: 'java-find-secbugs-PREDICTABLE_RANDOM',
      offender: 'In method com.hawkeye.java.test.config.MyVulnerableConfigClass.generateSecretToken()',
      description: 'The use of java.util.Random is predictable',
      mitigation: 'Check line(s) 30'
    }])
  })

  it('should parse low priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    const results = await run(fm)

    expect(results.results.low).to.deep.equal([{
      code: 'java-find-secbugs-CRLF_INJECTION_LOGS',
      description: 'This use of Logger.info(...) might be used to include CRLF characters into log messages',
      mitigation: 'Check line(s) 50, 55, 57, 59, 60, 61',
      offender: 'In method com.hawkeye.java.Application.main(String[])'
    }])
  })

  it('should error when findsecbugs errored', () => {
    exec.command.throws(new Error('some error'))
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
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
      .withArgs('findSecBugsReport.xml').returns(false)

    return expect(run(fm)).to.be.rejectedWith(Error)
  })
})
