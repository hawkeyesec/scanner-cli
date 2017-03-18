'use strict';
const CliTable = require('cli-table');
const spawnSync = require('child_process').spawnSync;

let Table = function() {
  let self = {};

  let maxWidth;

  try {
    maxWidth = spawnSync('tput', ['cols'], {
      stdio: ['inherit', 'pipe', 'inherit']
    }).stdout.toString().trim();
  } catch(ex) {
    maxWidth = 100;
  }

  // Calculate the maximum width needed for each column
  self.smartColWidth = function(data) {
    let cols = {};

    data.forEach(row => {
      let colx = 0;
      row.forEach(col => {
        if(cols[colx] === undefined || cols[colx] < col.length) {
          let longestLine = col.split('\n').sort((a, b) => { return a.length < b.length; })[0].length;
          cols[colx] = longestLine + 6;
        }
        colx ++;
      });
    });
    let mapped = Object.keys(cols).map(key => {
      return cols[key];
    });
    let sum = mapped.reduce(function(a, b) { return a + b; }, 0);
    if(sum > maxWidth) {
      let diff = maxWidth - sum;
      mapped[mapped.length-1] = (mapped[mapped.length-1] + diff);
    }
    return mapped;
  };

  self.generate = (headers, data, widths) => {
    let table = new CliTable({
      head: headers,
      colWidths: widths || self.smartColWidth(data),
      style : {compact : false, 'padding-left' : 1}
    });
    table.push(...data);
    console.log(table.toString());
  };

  return Object.freeze(self);
};
module.exports = Table;
