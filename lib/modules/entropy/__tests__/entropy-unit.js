'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../fileManager')

describe('Entropy Module', () => {
  const target = path.join(__dirname, './sample')
  let fm, results, opts

  beforeEach(() => {
    results = {
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

  it('should match password in a file', async () => {
    await run(opts)
    expect(results.low).to.have.been.calledOnce
    expect(results.low).to.have.been.calledWith({
      code: '1',
      description: 'High entropy string detected in file',
      mitigation: 'Check line number: 2',
      offender: 'some-file-with-password.cfg'
    })
  })
})
