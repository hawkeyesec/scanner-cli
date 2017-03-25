'use strict';
const util = require('../../util');
module.exports = function BundlerScan(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  // Set your module definition here
  const self = {};
  self.key = 'bundler';
  self.name = 'Bundler Scan';
  self.description = 'Scan for Ruby gems with known vulnerabilities';
  self.enabled = false;

  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;

    return fileManager.exists('Gemfile.lock')
  };

  self.run = function(results, done) {
    const auditCommand = 'bundle-audit';

    options.exec.command(auditCommand, {
      cwd: fileManager.target
    }, (err, data) => {
      const result = data.stdout;
      if (result !== 'No vulnerabilities found') {
        results.critical(result, "vulnerabilities", 'extraInformation', {});
      }

      done();
    });
  };
  return Object.freeze(self);
};
