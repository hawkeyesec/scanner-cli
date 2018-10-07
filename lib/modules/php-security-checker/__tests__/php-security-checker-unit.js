'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

const sample = require('./sample/securitychecker.json')

describe('PHP Security Checker Module', () => {
  let results, exec, logger, fm, opts
  const target = path.join(__dirname, './sample')

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    exec = {
      command: (cmd, pwd, cb) => cb(null, { stdout: JSON.stringify(sample) }),
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

  it('should handle project', () => {
    expect(handles(opts)).to.be.true
  })

  it('should not run on missing executable', () => {
    exec.commandExists = () => false
    expect(handles(opts)).to.be.false
    expect(logger.warn).to.have.been.called
  })

  it('should execute checker without excludes', async () => {
    sinon.spy(exec, 'command')
    await run(opts)
    expect(exec.command).to.have.been.calledWith('security-checker.phar security:check --format json', { cwd: target })
  })

  it('should log high severity issues', async () => {
    await run(opts)
    expect(results.high).to.have.been.calledWith({
      code: 'CVE-2018-1234567890',
      offender: 'firebase/php-jwt',
      description: 'Critical vulnerabilities in JSON Web Token libraries',
      mitigation: 'https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/'
    })
  })
})
