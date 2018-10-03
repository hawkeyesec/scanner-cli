'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../fileManager')

describe('Contents Module', () => {
  const target = path.join(__dirname, './sample')
  let fm, results, opts

  beforeEach(() => {
    results = {
      critical: sinon.mock(),
      high: sinon.mock(),
      medium: sinon.mock(),
      low: sinon.mock()
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
    results.critical.once().withArgs({
      code: 2,
      description: 'Private key in file',
      mitigation: 'Check line number: 1',
      offender: 'some_file_with_private_key_in.md'
    })
    await run(opts)
  })

  it('should match password in a file', async () => {
    results.low.once().withArgs({
      code: 1,
      description: 'Potential password in file',
      mitigation: 'Check line number: 1',
      offender: 'some_file_with_password.cfg'
    })
    await run(opts)
  })
})
