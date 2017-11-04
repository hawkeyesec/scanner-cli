'use strict';
const util = require('../../util');

module.exports = function Safety(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'safetyScan';
  self.name = 'Safety Scan';
  self.description = 'Safety checks your installed dependencies for known security vulnerabilities.';
  self.enabled = true;
  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const requirements = fileManager.exists('requirements.txt');
    if(requirements && !options.exec.commandExists('safety')) {
      options.logger.warn('requirements.txt found but safety not found in $PATH');
      options.logger.warn(`${self.key} will not run unless you install safety`);
      options.logger.warn('Please see: https://github.com/pyupio/safety');
      return false;
    }
    return requirements;
  };

  self.run = function(results, done) {
    const safetyCommand = 'safety check --json -r requirements.txt';
    options.exec.command(safetyCommand, {cwd: fileManager.target}, (err, data) => {
      const errors = JSON.parse(data.stdout);

      if(errors.length === 0) { return done(); }

      errors.forEach(result => {
        const item = {
          code: result[4],
          offender: `${result[0]} ${result[2]}`,
          description: result[3],
          mitigation: `Versions ${result[1]} are vulnerable. Update to a non vulnerable version.`
        };

        results.high(item);
      });

      done();
    });
  };

  return Object.freeze(self);
};
