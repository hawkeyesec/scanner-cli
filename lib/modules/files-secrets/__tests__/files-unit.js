'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('Files Module', () => {
  const target = path.join(__dirname, './sample')
  let fm

  beforeEach(() => {
    fm = new FileManager({ target })
  })

  it('should handle anything', () => {
    expect(handles()).to.be.true
  })

  it('should match RSA private keys', async () => {
    const results = await run(fm)
    expect(results.results.critical[0]).to.deep.equal({
      code: 'files-secrets-some-file-with-private-key-in.asc-11',
      description: 'Potential cryptographic key bundle',
      mitigation: 'Check contents of the file',
      offender: 'some-file-with-private-key-in.asc'
    })
  })
})
