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

  let pathToJson, fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    pathToJson = path.join(fileManager.target, 'package.json');
    return fs.existsSync(pathToJson);
  };

  const getModules = json => {
    const dev = util.defaultValue(json.devDependencies, {});
    const deps = util.defaultValue(json.dependencies, {});
    return Object.assign(dev, deps);
  };

  self.run = function(results, done) {
    let nsuCommand = path.join(__dirname, '../../../node_modules/npm-check-updates/bin/ncu -j');

    options.exec.command(nsuCommand, {
      cwd: path.dirname(pathToJson)
    }, (err, data) => {
      const originalJson = require(pathToJson);
      const original = getModules(originalJson);

      const updatedJson = JSON.parse(data.stdout);
      const updated = getModules(updatedJson);

      Object.keys(updated).forEach(key => {
        /* jshint maxcomplexity: 5*/
        let updatedDep = updated[key];
        let originalDep = original[key];

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
