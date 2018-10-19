'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('Credit Card Number Module', () => {
  it('should handle anything', async () => {
    expect(await handles()).to.be.true
  })

  it(`should match credit card numbers`, async () => {
    const target = path.join(__dirname, `./sample`)
    const fm = new FileManager({ target })
    const { results } = await run(fm)
    expect(results.high).to.deep.equal([{
      code: 'files-ccnumber-amex.cfg-1',
      offender: 'amex.cfg',
      description: 'Potential American Express card number in file',
      mitigation: 'Check line number: 1'
    }, {
      code: 'files-ccnumber-diners-club.cfg-2',
      offender: 'diners-club.cfg',
      description: 'Potential Diners Club card number in file',
      mitigation: 'Check line number: 1'
    }, {
      code: 'files-ccnumber-mastercard.cfg-6',
      offender: 'mastercard.cfg',
      description: 'Potential Mastercard card number in file',
      mitigation: 'Check line number: 4'
    }, {
      code: 'files-ccnumber-visa.cfg-7',
      offender: 'visa.cfg',
      description: 'Potential Visa card number in file',
      mitigation: 'Check line number: 1'
    }])
  })
})
