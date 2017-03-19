'use strict';
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const util = require('../util');

module.exports = function Nsp(options) {
  util.enforceArgs(options, ['target']);
  options.exec = util.defaultValue(options.exec, () => { new require('../exec')(); });

  let self = {};
  self.key = 'ncu';
  self.name = 'Node Check Updates';
  self.description = 'Scans a package.json for out of date packages';
  self.enabled = true;

  let jsonPath = path.join(options.target, 'package.json');

  self.handles = function() {
    return fs.existsSync(jsonPath);
  };
  self.run = function(results, done) {
    options.exec.command(path.join(__dirname, '../../node_modules/npm-check-updates/bin/ncu -j'), {}, (err, data) => {
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
