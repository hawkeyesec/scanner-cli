'use strict';
const table = new require('../table')();
require('colors');

module.exports = function SummaryWriter() {
  let self = {};
  let writeTable = (level, results, widths) => {
    if(results.length === 0) { return; }
    console.log(level.bold);
    table.generate(['module', 'name', 'description'], results, widths);
  };
  let caps = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  self.write = function(results) {
    let data = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    [ 'critical', 'high', 'medium', 'low' ].forEach(level => {
      results.forEach(result => {
        data[level] = data[level].concat(result.results[level].map(item => {
          return [result.module.key, item.name, item.description];
        }));
      });
    });
    let widths = table.smartColWidth(data.critical.concat(data.high).concat(data.medium).concat(data.low));
    Object.keys(data).forEach(key => {
      writeTable(caps(key), data[key], widths);
    });
  };
  return Object.freeze(self);
};
