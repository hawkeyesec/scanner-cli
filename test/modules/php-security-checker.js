'use strict'
const SecurityChecker = require('../../lib/modules/php-security-checker')
const FileManager = require('../../lib/fileManager')
const deride = require('deride')
const path = require('path')
const should = require('should')

describe('security-checker', () => {
  let sample = require('../samples/securitychecker.json')

  let securityChecker, mockExec, mockResults
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists'])
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    })
    mockExec.setup.commandExists.toReturn(true)
    const nullLogger = deride.stub(['log', 'warn', 'debug', 'error'])
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/php'),
      logger: nullLogger
    })

    mockResults = deride.stub(['low', 'medium', 'high', 'critical'])
    securityChecker = new SecurityChecker({
      exec: mockExec
    })
    should(securityChecker.handles(fileManager)).eql(true)
  })

  it('should execute security-checker.phar', done => {
    securityChecker.run(mockResults, () => {
      mockExec.expect.command.called.withArg('security-checker.phar security:check --format json')
      done()
    })
  })

  it('should report vulnerabilities', done => {
    securityChecker.run(mockResults, () => {
      const item = {
        code: '',
        offender: 'firebase/php-jwt',
        description: 'Critical vulnerabilities in JSON Web Token libraries',
        mitigation: 'https://auth0.com/blog/2015/03/31/critical-vulnerabilities-in-json-web-token-libraries/'
      }

      mockResults.expect.high.called.withArgs(item)
      done()
    })
  })
})
