'use strict';
const table = require('console.table');

module.exports = function ConsoleWriter() {
  const self = {
    key: 'console'
  };

  const PivotResult = function(module, level, results) {
    return results.map(result => {
      return {
        level: level,
        description: result.description,
        offender: result.offender,
        mitigation: result.mitigation || ''
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
    console.log = console.error;
    if(pivot.length > 0) {
      table(pivot);
    }
    done();
  };
  return Object.freeze(self);
};
