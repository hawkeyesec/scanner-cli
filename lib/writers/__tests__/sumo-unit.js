'use strict'

const nock = require('nock')
const { write } = require('../sumo')

const host = 'http://sumo.foobar'
const path = '/collector'
const opts = {
  url: host + path,
  host
}

describe('Writer', () => {
  it('should send to collector', async () => {
    const payload1 = {
      module: 'files-ccnumber',
      level: 'critical',
      code: 'files-secrets-47',
      offender: 'testfile1.yml',
      description: 'Contains word: password',
      mitigation: 'Check contents of the file'
    }
    const payload2 = {
      module: 'files-ccnumber',
      level: 'critical',
      code: 'files-secrets-47',
      offender: 'testfile2.yml',
      description: 'Contains word: password',
      mitigation: 'Check contents of the file'
    }
    const payload3 = {
      module: 'files-contents',
      level: 'critical',
      code: 'files-contents-2',
      offender: 'testfile3.yml',
      description: 'Private key in file',
      mitigation: 'Check line number: 3'
    }

    nock(host, {
      reqheaders: {
        'User-Agent': 'hawkeye',
        'X-Sumo-Category': /files-[ccnumber|contents]/,
        'X-Sumo-Host': host
      }
    })
      .post(path, payload1)
      .reply(200)
      .post(path, payload2)
      .reply(200)
      .post(path, payload3)
      .reply(200)

    await write([payload1, payload2, payload3], opts)
  })
})
