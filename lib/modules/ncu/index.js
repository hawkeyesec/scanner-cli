'use strict';
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const util = require('../../util');

module.exports = function Ncu(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  let self = {};
  self.key = 'ncu';
  self.name = 'Node Check Updates';
  self.description = 'Scans a package.json for out of date packages';
  self.enabled = true;

  let pathToJson;
  let target;
  self.handles = function(t) {
    util.enforceNotEmpty(t);
    target = t;
    pathToJson = path.join(target, 'package.json');
    return fs.existsSync(pathToJson);
  };

  self.run = function(results, done) {
    let nsuCommand = path.join(__dirname, '../../../node_modules/npm-check-updates/bin/ncu -j');

    options.exec.command(nsuCommand, {
      cwd: path.dirname(pathToJson)
    }, (err, data) => {
      let original = require(pathToJson);
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
