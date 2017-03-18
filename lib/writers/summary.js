'use strict';
const table = new require('../table')();
require('colors');

module.exports = function SummaryWriter() {
  let self = {};
  let writeTable = (level, results, widths) => {
    if(results.length === 0) { return; }
    console.log(level.bold);
    table.generate(['key', 'name', 'description'], results, widths);
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
          return [item.key, item.name, item.description];
        }));
      });
    });
    let widths = table.smartColWidth(data.critical);
    Object.keys(data).forEach(key => {
      writeTable(key, data[key], widths);
    });
  };
  return Object.freeze(self);
};
