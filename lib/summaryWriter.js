'use strict';
const Table = require('cli-table');
require('colors');

module.exports = function SummaryWriter() {
  let self = {};
  let write = (level, results) => {
    if(results.length === 0) { return; }
    console.log(level.bold);
    var table = new Table({
      head: ['key', 'name', 'description'],
      colWidths: [20, 20, 60]
    });

    results.forEach(result => {
      table.push([result.key, result.name, result.description]);
    });
    console.log(table.toString());
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
