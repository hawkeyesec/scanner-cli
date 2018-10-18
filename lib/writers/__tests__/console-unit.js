'use strict'

/* eslint-disable no-unused-expressions */

const { write } = require('../console')

describe('Writer', () => {
  it('should write to console', async () => {
    sinon.stub(console, 'table')
    const payload = [{
      module: 'files-ccnumber',
      level: 'critical',
      code: 'files-secrets-47',
      offender: 'testfile1.yml',
      description: 'Contains word: password',
      mitigation: 'Check contents of the file'
    }, {
      module: 'files-ccnumber',
      level: 'critical',
      code: 'files-secrets-47',
      offender: 'testfile2.yml',
      description: 'Contains word: password',
      mitigation: 'Check contents of the file'
    }, {
      module: 'files-contents',
      level: 'critical',
      code: 'files-contents-2',
      offender: 'testfile3.yml',
      description: 'Private key in file',
      mitigation: 'Check line number: 3'
    }]

    await write(payload)

    expect(console.table).to.have.been.calledOnce
    expect(console.table).to.have.been.calledWith(payload)
  })
})
