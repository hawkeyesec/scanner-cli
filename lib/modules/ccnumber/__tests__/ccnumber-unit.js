'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe.only('Credit Card Number Module', () => {
  it('should handle anything', () => {
    expect(handles()).to.be.true
  })

  it(`should match credit card numbers`, async () => {
    const target = path.join(__dirname, `./sample`)
    const results = { high: sinon.stub() }
    const fm = new FileManager({ target })
    await run({ fm, results })
    expect(results.high).to.have.callCount(4)
    expect(results.high.args[0][0]).to.deep.equal({
      code: 1,
      offender: 'amex.cfg',
      description: 'Potential American Express card number in file',
      mitigation: 'Check line number: 1'
    })
    expect(results.high.args[1][0]).to.deep.equal({
      code: 2,
      offender: 'diners-club.cfg',
      description: 'Potential Diners Club card number in file',
      mitigation: 'Check line number: 1'
    })
    expect(results.high.args[2][0]).to.deep.equal({
      code: 6,
      offender: 'mastercard.cfg',
      description: 'Potential Mastercard card number in file',
      mitigation: 'Check line number: 4'
    })
    expect(results.high.args[3][0]).to.deep.equal({
      code: 7,
      offender: 'visa.cfg',
      description: 'Potential Visa card number in file',
      mitigation: 'Check line number: 1'
    })
  })
})
