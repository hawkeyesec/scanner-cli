'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('Contents Module', () => {
  const target = path.join(__dirname, './sample')
  let fm, results, opts

  beforeEach(() => {
    results = {
      critical: sinon.stub(),
      high: sinon.stub(),
      medium: sinon.stub(),
      low: sinon.stub()
    }
    const logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub()
    }
    fm = new FileManager({ target, logger })
    opts = { fm, results }
  })

  it('should handle anything', () => {
    expect(handles()).to.be.true
  })

  it('should match RSA private keys', async () => {
    const expected = {
      code: 2,
      description: 'Private key in file',
      mitigation: 'Check line number: 1',
      offender: 'some-file-with-private-key-in.md'
    }
    await run(opts)
    expect(results.critical).to.have.been.calledOnce
    expect(results.critical).to.have.been.calledWith(expected)
  })

  it('should match password in a file', async () => {
    const expected = {
      code: 1,
      description: 'Potential password in file',
      mitigation: 'Check line number: 1',
      offender: 'some-file-with-password.cfg'
    }
    await run(opts)
    expect(results.low).to.have.been.calledOnce
    expect(results.low).to.have.been.calledWith(expected)
  })
})
