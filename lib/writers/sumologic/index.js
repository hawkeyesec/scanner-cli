'use strict';
const util = require('../../util');
const request = require('request');
const async = require('async');
const logger = require('../../logger')();

module.exports = function SumoLogic(options) {
  util.enforceNotEmpty(options);
  util.enforceNotEmpty(options.url);

  const self = {
    key: 'sumologic'
  };

  const PivotResult = function(module, level, results) {
    return results.map(result => {
      return {
        level: level,
        module: module.key,
        description: result.description,
        offender: result.offender,
        extra: result.extra || '',
        data: result.data
      };
    });
  };

  self.write = function(results, metadata, done) {
    /* results are passed by module, so we need to pivot */
    let pivot = [];
    results.forEach(module => {
      Object.keys(module.results).forEach(level => {
        let results = module.results[level];
        pivot.push(...new PivotResult(module.module, level, results));
      });
    });

    const levels = {
      critical: 8,
      high: 4,
      medium: 2,
      low: 1
    };
    pivot = pivot.sort((a, b) => {
      return levels[a.level] - levels[b.level];
    }).reverse();

    logger.log('sending', pivot.length, 'results to SumoLogic');
    async.each(pivot, (result, next) => {
      var reqopts = {
        url: options.url,
        json: true,
        headers: {
          'User-Agent': 'hawkeye',
          'X-Sumo-Name': 'hawkeye',
          'X-Sumo-Category': result.module,
          'X-Sumo-Host': process.env.HOSTNAME || 'unknown'
        },
        body: result
      };
      request.post(reqopts, (err, result) => {
        if(err) { return next(err); }
        if(result.statusCode !== 200) { return next(new Error('Failed to send to sumologic, status: ' + result.statusCode)); }
        next();
      });
    }, done);

  };
  return Object.freeze(self);
};
