'use strict';
const path = require('path');
const semver = require('semver');
const util = require('../../util');

module.exports = function Ncu(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Node Check Updates';
  self.description = 'Scans a package.json for out of date packages';
  self.enabled = true;

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return fileManager.exists('package.json');
  };

  const getModules = json => {
    const dev = util.defaultValue(json.devDependencies, {});
    const deps = util.defaultValue(json.dependencies, {});
    return Object.assign(dev, deps);
  };

  self.run = function(results, done) {
    const nsuCommand = path.join(util.moduleResolve('npm-check-updates'), 'bin/ncu') + ' -j';

    options.exec.command(nsuCommand, {
      cwd: fileManager.target
    }, (err, data) => {
      if(!util.isEmpty(err)) {
        return done(err);
      }
      const originalJson = JSON.parse(fileManager.readFileSync('package.json'));
      const original = getModules(originalJson);

      const updatedJson = JSON.parse(data.stdout);
      const updated = getModules(updatedJson);

      Object.keys(updated).forEach(key => {
        /* jshint maxcomplexity: 5*/
        let updatedDep = updated[key];
        let originalDep = original[key];

        let data = {
          module: key,
          original: originalDep,
          updated: updatedDep
        };
        if(updatedDep !== originalDep) {
          updatedDep = updatedDep.replace(/[\^\~]+/, '');
          originalDep = originalDep.replace(/[\^\~]+/, '');
          let level = 'low';

          const item = {
            code: 3,
            offender: key,
            description: 'Module is one or more patch versions out of date',
            mitigation: 'Update to ' + updatedDep,
            data: data
          };

          if(semver.minor(originalDep) < semver.minor(updatedDep)) {
            item.description = 'Module is one or more minor versions out of date';
            item.code = 2;
            level = 'medium';
          }
          if(semver.major(originalDep) < semver.major(updatedDep)) {
            item.description = 'Module is one or more major versions out of date';
            item.code = 1;
            level = 'high';
          }

          results[level](item);
        }
      });
      done();
    });
  };
  return Object.freeze(self);
};
