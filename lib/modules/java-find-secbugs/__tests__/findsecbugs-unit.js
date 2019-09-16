'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

describe('FindSecBugs Module', () => {
  const sampleReportFile = path.join(__dirname, './sample/report.xml')
  const nonexistentReportFile = path.join(__dirname, './sample/nope.json')

  beforeEach(() => {
    sinon.stub(exec, 'exists').withArgs('findsecbugs').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: '' })
  })

  it('should handle java maven projects', async () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should handle java gradle projects', async () => {
    const target = path.join(__dirname, './sample/java-gradle')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should handle kotlin maven projects', async () => {
    const target = path.join(__dirname, './sample/kotlin-maven')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should handle kotlin gradle projects', async () => {
    const target = path.join(__dirname, './sample/kotlin-gradle')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should handle scala sbt projects', async () => {
    const fm = new FileManager({ target: path.join(__dirname, './sample/scala-sbt') })
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.withArgs('findsecbugs').resolves(false)
    const target = path.join(__dirname, './sample/java-gradle')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.false
  })

  it('should not run on missing jars', async () => {
    const target = path.join(__dirname, './sample/mvn-with-no-jar')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.false
  })

  it('should execute findsecbugs with all required arguments', async () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    await run(fm, sampleReportFile)

    expect(exec.command.firstCall.args[0]).to.equal('which findsecbugs')
    expect(exec.command.secondCall.args[0]).to.equal(`findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${sampleReportFile} ${target}/target/main.jar`)
  })

  it('should parse high priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    const { results } = await run(fm, sampleReportFile)

    expect(results.high).to.deep.equal([{
      code: 'java-find-secbugs-XML_DECODER-com.hawkeye.java.test.controller.MyVulnerableControllerClass',
      offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
      description: 'It is not safe to use an XMLDecoder to parse user supplied data',
      mitigation: 'Check line(s) [47-48]'
    }])
  })

  it('should parse medium priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    const { results } = await run(fm, sampleReportFile)

    expect(results.medium).to.deep.equal([{
      code: 'java-find-secbugs-PREDICTABLE_RANDOM-com.hawkeye.java.test.config.MyVulnerableConfigClass',
      offender: 'In method com.hawkeye.java.test.config.MyVulnerableConfigClass.generateSecretToken()',
      description: 'The use of java.util.Random is predictable',
      mitigation: 'Check line(s) 30'
    }])
  })

  it('should parse low priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    const { results } = await run(fm, sampleReportFile)

    expect(results.low).to.deep.equal([{
      code: 'java-find-secbugs-CRLF_INJECTION_LOGS-com.hawkeye.java.Application',
      description: 'This use of Logger.info(...) might be used to include CRLF characters into log messages',
      mitigation: 'Check line(s) 50, 55, 57, 59, 60, 61',
      offender: 'In method com.hawkeye.java.Application.main(String[])'
    }])
  })

  it('should error when findsecbugs errored', () => {
    exec.command.throws(new Error('some error'))
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    return expect(run(fm, sampleReportFile)).to.be.rejectedWith(Error)
  })

  it('should error when no report present ', () => {
    const target = path.join(__dirname, './sample/java-maven')
    const fm = new FileManager({ target })

    return expect(run(fm, nonexistentReportFile)).to.be.rejectedWith(Error)
  })
})
