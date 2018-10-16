'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../file-manager')

describe('node crossenv Module', () => {
  const target = path.join(__dirname, './sample')
  let fm

  beforeEach(() => {
    fm = new FileManager({ target })
  })

  it('should handle node projects', async () => {
    expect(await handles(fm)).to.be.true
  })

  it('should inspect package.json', async () => {
    const { results } = await run(fm)
    expect(results.critical.length).to.equal(3)
    expect(results.critical[0]).to.deep.equal({
      'code': 'node-crossenv-0',
      'description': 'node-crossenv malware found',
      'mitigation': 'http://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry',
      'offender': 'crossenv'
    })
  })
})
