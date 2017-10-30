'use strict';
const util = require('../../util');

module.exports = function Safety(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'safety';
  self.name = 'Safety Scan';
  self.description = 'Safety checks your installed dependencies for known security vulnerabilities.';
  self.enabled = true;
  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return fileManager.exists('requirements.txt');
  };

  self.run = function(results, done) {
    const safetyCommand = 'safety check --json -r requirements.txt';
    options.exec.command(safetyCommand, {cwd: fileManager.target}, (err, data) => {
      const errors = JSON.parse(data.stdout);

      if(errors.length === 0) { return done(); }

      errors.forEach(result => {
        const item = {
          code: result[4],
          offender: result[0]+' '+result[2],
          description: result[3],
          mitigation: result[1]
        };

        results.high(item);
      });

      done();
    });
  };

  return Object.freeze(self);
};
