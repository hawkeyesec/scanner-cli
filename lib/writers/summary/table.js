'use strict';
const CliTable = require('cli-table');
const spawnSync = require('child_process').spawnSync;
const logger = new require('../../logger')({
  namespace: 'table'
});

let Table = function() {
  let self = {};

  let maxWidth;
  let minWidth = 100;

  try {
    maxWidth = spawnSync('tput', ['cols'], {
      stdio: ['inherit', 'pipe', 'inherit']
    }).stdout.toString().trim() - 4;
  } catch(ex) {
    maxWidth = 100;
  } finally {
    if(maxWidth < minWidth) { 
      maxWidth = minWidth;
    }  
  }

  // Calculate the maximum width needed for each column
  self.smartColWidth = function(data) {
    let cols = {};
    data.forEach(row => {
      let colx = 0;
      row.forEach(col => {
        let line = col.split('\n').sort((a, b) => { return a.length < b.length; })[0].length;
        if(cols[colx] === undefined || cols[colx] < line) {
          cols[colx] = line + 2;
        }
        colx ++;
      });
    });

    cols = Object.keys(cols).map(key => {
      let width = cols[key];
      if(width < 9) { width = 9; }
      return width;
    });

    let sum = cols.reduce(function(a, b) { return a + b; }, 0);
    if(sum > maxWidth) {
      let diff = maxWidth - sum;
      cols[cols.length-1] = (cols[cols.length-1] + diff);
    }
    return cols;
  };

  self.generate = (headers, data, widths) => {
    let options = {
      head: headers,
      colWidths: widths || self.smartColWidth(data),
      style : { compact : false, 'padding-left' : 1 }
    };
    logger.debug('drawing table', options);
    logger.debug('rows', data.length);
    let table = new CliTable(options);
    table.push(...data);
    console.log(table.toString());
  };

  return Object.freeze(self);
};
module.exports = Table;
