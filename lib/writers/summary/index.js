'use strict';
const table = new require('./table')();
require('colors');

module.exports = function SummaryWriter() {
  const self = {
    key: 'summary'
  };
  const writeTable = (level, results, widths) => {
    if(results.length === 0) { return; }
    console.log(level.bold);
    table.generate(['module', 'name', 'description'], results, widths);
    console.log('');
  };
  const caps = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  self.write = function(results) {
    const data = {
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
    const widths = table.smartColWidth(data.critical.concat(data.high).concat(data.medium).concat(data.low));
    Object.keys(data).forEach(key => {
      writeTable(caps(key), data[key], widths);
    });
  };
  return Object.freeze(self);
};
