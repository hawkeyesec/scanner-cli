'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { handles, run } = require('..')

const sample = require('./sample/securitychecker.json')

describe('PHP Security Checker Module', () => {
  let fm
  const target = path.join(__dirname, './sample')

  beforeEach(() => {
    sinon.stub(exec, 'exists').resolves(true)
    sinon.stub(exec, 'command').resolves({ stdout: JSON.stringify(sample) })
    fm = new FileManager({ target })
  })

  it('should handle project', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should not run on missing executable', async () => {
    exec.exists.resolves(false)
    expect(await handles(fm)).to.be.false
  })

  it('should execute checker without excludes', async () => {
    await run(fm)
    expect(exec.command).to.have.been.calledWith('security-checker.phar security:check --format json', { cwd: target })
  })

  it('should log high severity issues', async () => {
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'php-security-checker-CVE-2018-1234567890',
      offender: 'firebase/php-jwt',
      description: 'Critical vulnerabilities in JSON Web Token libraries',
      mitigation: 'https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/'
    }])
  })
})
