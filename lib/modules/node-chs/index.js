'use strict';
const util = require('../../util');
const semver = require('semver');

module.exports = function Nsp(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Node Constant Hashtable Seed check';
  self.description = 'Scans a package.json to check for CHS issues.';
  self.enabled = false;

  let checkVersion = (results, version) => {
    semver.clean(version);
    const vulnerable = ['4.8.3', '6.11.0', '7.10.0', '8.1.3'];
    vulnerable.every(vulnerable => {
      const bad = semver.satisfies(vulnerable, version);
      if(bad) {
        const data = {
          information: `Please see https://nodejs.org/en/blog/vulnerability/july-2017-security-releases/\n
          It is advised that you update the engines section of your package.json to ensure that
          your module throws a warning when being installed against a version of nodejs which is vulnerable
          `
        };
        results.low({
          code: '1',
          offender: 'package.json',
          description: 'Module can be run on vulnerable nodejs (' + vulnerable + ')',
          mitigation: 'https://nodejs.org/en/blog/vulnerability/july-2017-security-releases',
          data: data
        });
        return false;
      }
      return true;
    });
  };

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return fileManager.exists('package.json');
  };

  self.run = function(results, done) {
    fileManager.readFile('package.json', (err, data) => {
      data = JSON.parse(data);
      if(data.engines) {
        if(data.engines.node) {
          checkVersion(results, data.engines.node);
        }
      }
      done();
    });
  };
  return Object.freeze(self);
};
