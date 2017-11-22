'use strict';
const util = require('../../util');

module.exports = function Brakeman(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'brakemanScan';
  self.name = 'Brakeman Scan';
  self.description = 'Brakeman statically analyzes Rails application code to find security issues at any stage of development.';
  self.enabled = true;
  let fileManager;

  const isRailsApp = () => {
    return fileManager.readFileSync('Gemfile').indexOf('rails') >= 0;
  };

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;

    const shouldHandle = fileManager.exists('Gemfile') && isRailsApp();

    if(shouldHandle && !options.exec.commandExists('brakeman')) {
      options.logger.warn('Gemfile found but brakeman not found in $PATH');
      options.logger.warn(`${self.key} will not run unless you install brakeman`);
      options.logger.warn('Please see: https://brakemanscanner.org/docs/install/');
      return false;
    }
    return shouldHandle;
  };

  self.run = function(results, done) {
    const brakemanCommand = 'brakeman . -f json';
    options.exec.command(brakemanCommand, {cwd: fileManager.target}, (err, data) => {

      const errors = JSON.parse(data.stdout).warnings;

      if(errors.length === 0) { return done(); }

      errors.forEach(error => {
        const item = {
          code: 1,
          offender: `${error.file}`,
          description: `${error.message} (${error.link})`,
          mitigation: `Check line ${error.line}`
        };
        results.high(item);
      });

      done();
    });
  };

  return Object.freeze(self);
};
