'use strict';
const table = new require('../table')();
require('colors');

module.exports = function SummaryWriter() {
  let self = {};
  let write = (level, results) => {
    if(results.length === 0) { return; }
    console.log(level.bold);
    let data = [];
    results.forEach(result => {
      data.push([result.key, result.name, result.description]);
    });

    table.generate(['key', 'name', 'description'], data);
  };

  self.write = function(results) {
    [ 'critical', 'high', 'medium', 'low' ].forEach(level => {
      let all = [];
      results.forEach(moduleResult => {
        all = all.concat(moduleResult.results[level]);
      });
      write(level, all);
    });
  };
  return Object.freeze(self);
};
