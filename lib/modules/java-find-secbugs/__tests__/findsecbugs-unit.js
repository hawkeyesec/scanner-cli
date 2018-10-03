'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const fs = require('fs')
const FileManager = require('../../../fileManager')
const { handles, run } = require('..')

describe('FindSecBugs Module', () => {
  let results, exec, logger
  const sampleReport = fs.readFileSync(path.join(__dirname, './sample/findSecBugsReport.xml'), 'utf-8')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null, { stdout: null }),
      commandSync: () => ({ stdout: '/usr/bin/findsecbugs' }),
      commandExists: () => true
    }
    logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    }
  })

  it('should handle maven projects', () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })

    expect(handles({ fm, results, exec, logger })).to.be.true
  })

  it('should handle maven projects', () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })

    expect(handles({ fm, results, exec, logger })).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    const target = path.join(__dirname, './sample/gradle')
    const fm = new FileManager({ target, logger })

    expect(handles({ fm, results, exec, logger })).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should not run on missing jars', () => {
    const target = path.join(__dirname, './sample/mvn-with-no-jar')
    const fm = new FileManager({ target, logger })

    expect(handles({ fm, results, exec, logger })).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should execute findsecbugs with all required arguments', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)
    sinon.spy(exec, 'command')

    await run({ fm, results, exec, logger })

    expect(exec.command.firstCall.args[0]).to.equal(`findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${target}/findSecBugsReport.xml ${target}/target/main.jar`)
  })

  it('should parse high priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    await run({ fm, results, exec, logger })

    expect(results.high).to.have.been.calledOnce
    expect(results.high).to.have.been.calledWith({
      code: 'XML_DECODER',
      offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
      description: 'It is not safe to use an XMLDecoder to parse user supplied data',
      mitigation: 'Check line(s) [47-48]'
    })
  })

  it('should parse medium priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    await run({ fm, results, exec, logger })

    expect(results.medium).to.have.been.calledOnce
    expect(results.medium).to.have.been.calledWith({
      code: 'PREDICTABLE_RANDOM',
      offender: 'In method com.hawkeye.java.test.config.MyVulnerableConfigClass.generateSecretToken()',
      description: 'The use of java.util.Random is predictable',
      mitigation: 'Check line(s) 30'
    })
  })

  it('should parse low priority issues correctly', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(true)

    await run({ fm, results, exec, logger })

    expect(results.low).to.have.been.calledOnce
    expect(results.low).to.have.been.calledWith({
      code: 'CRLF_INJECTION_LOGS',
      description: 'This use of Logger.info(...) might be used to include CRLF characters into log messages',
      mitigation: 'Check line(s) 50, 55, 57, 59, 60, 61',
      offender: 'In method com.hawkeye.java.Application.main(String[])'
    })
  })

  it('should error when findsecbugs errored', async () => {
    const target = path.join(__dirname, './sample/maven')
    exec.command = (cmd, pwd, cb) => cb(new Error('some error'))
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)

    let hasErrored = false
    try {
      await run({ fm, results, exec, logger })
    } catch (e) {
      hasErrored = true
    }
    expect(hasErrored).to.be.true
  })

  it('should error when no report present ', async () => {
    const target = path.join(__dirname, './sample/maven')
    const fm = new FileManager({ target, logger })
    sinon.stub(fm, 'readFileSync').returns(sampleReport)
    sinon.stub(fm, 'exists')
      .withArgs('target').returns(true)
      .withArgs('findSecBugsReport.xml').returns(false)

    let hasErrored = false
    try {
      await run({ fm, results, exec, logger })
    } catch (e) {
      hasErrored = true
    }
    expect(hasErrored).to.be.true
  })
})
