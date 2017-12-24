'use strict';
const util = require('../../util');

module.exports = function Brakeman(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Brakeman Scan';
  self.description = 'Brakeman statically analyzes Rails application code to find security issues.';
  self.enabled = true;
  let fileManager;

  const isRailsApp = () => {
    return fileManager.readFileSync('Gemfile').indexOf('rails') >= 0;
  };

  const containsAppFolder = () => {
    return fileManager.exists('app');
  };

  const isRubyProject = () => {
    return fileManager.exists('Gemfile');
  };

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;

    const shouldHandle =  isRubyProject() && isRailsApp();

    if(shouldHandle && !options.exec.commandExists('brakeman')) {
      options.logger.warn('Rails project found but brakeman not found in $PATH');
      options.logger.warn(`${self.key} will not run unless you install brakeman`);
      options.logger.warn('Please see: https://brakemanscanner.org/docs/install/');
      return false;
    }

    if(shouldHandle && !containsAppFolder()) {
      options.logger.warn('Rails project found but app folder was not found');
      options.logger.warn(`${self.key} only run on Rails projects with an app folder`);
      return false;
    }

    return shouldHandle;
  };

  self.run = function(results, done) {
    const brakemanCommand = `brakeman . -f json -o ${fileManager.target}/output.json`;
    options.exec.command(brakemanCommand, {cwd: fileManager.target}, () => {

      if(!fileManager.exists('output.json'))
        return done({'message': 'There was an error while executing Brakeman and the report was not created'});

      const brakemanOutput = fileManager.readFileSync('output.json');
      const errors = JSON.parse(brakemanOutput).warnings;

      if(errors.length === 0) { return done(); }

      errors.forEach(error => {
        /* jshint camelcase: false */
        const item = {
          code: error.check_name,
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
