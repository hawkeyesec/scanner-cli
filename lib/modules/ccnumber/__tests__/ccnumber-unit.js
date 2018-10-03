'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../fileManager')

describe('Credit Card Number Module', () => {
  let logger
  beforeEach(() => {
    logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub()
    }
  })

  it('should handle anything', () => {
    expect(handles()).to.be.true
  })

  it(`should match credit card numbers`, async () => {
    const target = path.join(__dirname, `./sample`)
    const results = { high: sinon.stub() }
    const fm = new FileManager({ target, logger })
    await run({ fm, results })
    expect(results.high).to.have.callCount(4)
    expect(results.high.args[0][0].offender).to.equal('amex.cfg')
    expect(results.high.args[1][0].offender).to.equal('diners-club.cfg')
    expect(results.high.args[2][0].offender).to.equal('mastercard.cfg')
    expect(results.high.args[3][0].offender).to.equal('visa.cfg')
  })
})
