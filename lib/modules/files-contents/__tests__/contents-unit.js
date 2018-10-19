'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('Contents Module', () => {
  let fm

  beforeEach(() => {
    fm = new FileManager({ target: path.join(__dirname, './sample') })
  })

  it('should handle anything', async () => {
    expect(await handles()).to.be.true
  })

  it('should match RSA private keys', async () => {
    const expected = [{
      code: 'files-contents-some-file-with-private-key-in.md-2',
      description: 'Private key in file',
      mitigation: 'Check line number: 1',
      offender: 'some-file-with-private-key-in.md'
    }]
    const { results } = await run(fm)
    expect(results.critical).to.deep.equal(expected)
  })

  it('should match password in a file', async () => {
    const expected = [{
      code: 'files-contents-some-file-with-password.cfg-1',
      description: 'Potential password in file',
      mitigation: 'Check line number: 1',
      offender: 'some-file-with-password.cfg'
    }]
    const { results } = await run(fm)
    expect(results.low).to.deep.equal(expected)
  })
})
