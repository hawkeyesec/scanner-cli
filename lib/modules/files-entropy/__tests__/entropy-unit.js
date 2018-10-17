'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('Entropy Module', () => {
  let fm

  beforeEach(() => {
    fm = new FileManager({ target: path.join(__dirname, './sample') })
  })

  it('should handle anything', async () => {
    expect(await handles()).to.be.true
  })

  it('should match password in a file', async () => {
    const { results } = await run(fm)
    expect(results.low).to.deep.equal([{
      code: 'files-entropy-some-file-with-password.cfg-2',
      description: 'High entropy string detected in file',
      mitigation: 'Check line number: 2',
      offender: 'some-file-with-password.cfg'
    }])
  })
})
