'use strict';
const util = require('../../util');
const request = require('request');

module.exports = function HttpPoster(options) {
  options = util.defaultValue(options, {});
  util.enforceArgs(options, ['url']);
  const self = {
    key: 'http'
  };
  self.write = function(results, metadata, done) {
    const data = {
      metadata: metadata,
      results: results
    };
    var reqopts = {
      url: options.url,
      json: true,
      headers: {
        'User-Agent': 'hawkeye'
      },
      body: data
    };
    request.post(reqopts, (err, result) => {
      if(err) { return done(err); }
      if(result.statusCode < 200 || result.statusCode > 299) {
        return done(new Error('Failed to send to http endpoint, status: ' + result.statusCode));
      }
      done();
    });
  };
  return Object.freeze(self);
};
