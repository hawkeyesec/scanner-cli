'use strict'

const request = require('request')

module.exports = class HttpPoster {
  constructor ({ url }) {
    this.url = url
    this.key = 'http'
  }

  write (results, metadata, done) {
    const data = {
      metadata: metadata,
      results: results
    }
    var reqopts = {
      url: this.url,
      json: true,
      headers: {
        'User-Agent': 'hawkeye'
      },
      body: data
    }
    request.post(reqopts, (err, result) => {
      if (err) { return done(err) }
      if (result.statusCode < 200 || result.statusCode > 299) {
        return done(new Error('Failed to send to http endpoint, status: ' + result.statusCode))
      }
      done()
    })
  }
}
