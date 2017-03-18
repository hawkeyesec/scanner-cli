'use strict';
const fs = require('fs');
const path = require('path');
const exec = new require('../exec')();
const semver = require('semver');

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
        /* jshint maxcomplexity: 5*/
        let updatedDep = updated.dependencies[key];
        let originalDep = original.dependencies[key];
        if(updatedDep !== originalDep) {
          updatedDep = updatedDep.replace(/[\^\~]+/, '');
          originalDep = originalDep.replace(/[\^\~]+/, '');
          let level = 'low';
          let msg = 'Module is one or more patch versions out of date';
          if(semver.minor(originalDep) < semver.minor(updatedDep)) {
          msg = 'Module is one or more minor versions out of date';
            level = 'medium';
          }
          if(semver.major(originalDep) < semver.major(updatedDep)) {
          msg = 'Module is one or more major versions out of date';
            level = 'high';
          }

          results[level](key, msg + '\nInstalled: ' + originalDep + ', Available: ' + updatedDep);
        }
      });
      done();
    });
  };
  return Object.freeze(self);
};
