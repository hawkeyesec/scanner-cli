'use strict';
const util = require('../../util');

module.exports = function BundlerScan(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Bundler Scan';
  self.description = 'Scan for Ruby gems with known vulnerabilities';
  self.enabled = true;

  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const gemLock = fileManager.exists('Gemfile.lock');
    const command = options.exec.commandExists('bundle-audit');
    if(gemLock && !command) {
      options.logger.warn('Gemfile.lock found but bundle-audit not found in $PATH');
      options.logger.warn(self.key + ' will not run unless you install bundle-audit');
      options.logger.warn('Please see: https://github.com/rubysec/bundler-audit');
      return false;
    }
    return gemLock;
  };

  const getHandlerForCriticality = (results, criticality) => {
    return results[criticality] || results.low;
  };

  const resultParser = (text, results) => {
    const lines = text.split('\n');
    let vulnerability = {};
    lines.forEach(line => {
      const regex = {
        name: /Name: /,
        title: /Title: /,
        criticality: /Criticality: /,
        extraInfo: /Solution: /,
        code: /Advisory: /,
        url: /URL: /
      };

      (function matchLines() {
        for (const key of Object.keys(regex)) {
          const matchingLine = line.match(regex[key]);
          if (matchingLine){
            vulnerability[key] = line.split(matchingLine)[1];
          }
        }
      })();

      (function exportVulnerability() {
        if (Object.keys(vulnerability).length === 6) {
          const criticality = vulnerability.criticality.toLowerCase();
          const item = {
            code: vulnerability.code.toLowerCase(),
            offender: vulnerability.name,
            description: vulnerability.title,
            mitigation: vulnerability.url,
            data: vulnerability
          };

          getHandlerForCriticality(results, criticality)(item);
          vulnerability = {};
        }
      })();

      const insecureSourceMessage = 'Insecure Source URI';
      if (line.indexOf(insecureSourceMessage) > -1) {
        const item = {
          code: 1,
          offender: 'Gemfile',
          description: 'Insecure Source URI',
          mitigation: 'Use a https:// gem source'
        };

        results.low(item);
      }
    });
  };

  self.run = function(results, done) {
    const auditCommand = 'bundle-audit';
    options.logger.log('Updating bundler-audit database...');
    options.exec.command('bundle-audit update', null, err => {
      if(!util.isEmpty(err)) {
        options.logger.warn('Failed to update bundle-audit database.');
        options.logger.warn('You may be scanning with out of date definitions');
      }
      options.exec.command(auditCommand, {
        cwd: fileManager.target
      }, (err, data) => {
        if(!util.isEmpty(err)) {
          return done(err);
        }

        const result = data.stdout.toString();
        resultParser(result, results);
        done();
      });
    });
  };

  return Object.freeze(self);
};
