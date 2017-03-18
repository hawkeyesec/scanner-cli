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
  let smartColWidth = (data) => {
    let cols = {};

    data.forEach(row => {
      let colx = 0;
      row.forEach(col => {
        if(cols[colx] === undefined || cols[colx] < col.length) {
          let longestLine = col.split('\n').sort((a, b) => { return a.length < b.length; })[0].length;
          cols[colx] = longestLine + 1;
        }
        colx ++;
      });
    });
    let mapped = Object.keys(cols).map(key => {
      return cols[key] + 3;
    });
    let sum = mapped.reduce(function(a, b) { return a + b; }, 0);
    let diff = maxWidth - sum;
    if(diff < 0) {
      mapped[mapped.length-1] = (mapped[mapped.length-1] + diff) -5;
    }
    return mapped;
  };

  self.generate = (headers, data) => {
    let table = new CliTable({
      head: headers,
      colWidths: smartColWidth(data),
      style : {compact : false, 'padding-left' : 1}
    });
    table.push(...data);
    console.log(table.toString());
  };

  return Object.freeze(self);
};
module.exports = Table;
