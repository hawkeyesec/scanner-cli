'use strict'

const { write } = require('../json')
const path = require('path')
const { readFileSync, unlinkSync } = require('fs')

const metadata = {
  file: path.join(__dirname, 'testfile.json')
}

describe('JSON Writer', () => {
  it('should write JSON to a file', async () => {
    const findings = [{ 'key': 'value' }]
    const expected = JSON.stringify({ findings })

    await write(findings, metadata)

    expect(readFileSync(metadata.file).toString()).to.equal(expected)
    unlinkSync(metadata.file)
  })
})
