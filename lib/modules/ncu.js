'use strict';
const fs = require('fs');
const path = require('path');
const exec = new require('../exec')();

module.exports = function Nsp(target) {
  let self = {};
  self.key = 'ncu';
  self.name = 'Node Check Updates';
  self.description = 'Scans a package.json for out of date packages';
  let jsonPath = path.join(target, 'package.json');

  self.handles = function() {
    return fs.existsSync(jsonPath);
  };
  self.run = function(results, done) {
    exec.command(path.join(__dirname, '../../node_modules/npm-check-updates/bin/ncu -j'), {}, (err, data) => {
      let original = require(jsonPath);
      let updated = JSON.parse(data.stdout);
      Object.keys(updated.dependencies).forEach(key => {
        let updatedDep = updated.dependencies[key];
        let originalDep = original.dependencies[key];
        if(updatedDep !== originalDep) {
          results.low('ncu-outdated', key, 'installed: ' + originalDep + ', available: ' + updatedDep);
        }
      });
      done();
    });
  };
  return Object.freeze(self);
};
