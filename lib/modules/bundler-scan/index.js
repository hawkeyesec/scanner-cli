'use strict';
const util = require('../../util');

module.exports = function BundlerScan(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'bundlerScan';
  self.name = 'Bundler Scan';
  self.description = 'Scan for Ruby gems with known vulnerabilities';
  self.enabled = true;

  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;

    return fileManager.exists('Gemfile.lock');
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
        extraInfo: /Solution: /
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
        if (Object.keys(vulnerability).length === 4) {
          const criticality = vulnerability.criticality.toLowerCase();
          getHandlerForCriticality(results, criticality)(vulnerability.name, vulnerability.title, vulnerability.solution);
          vulnerability = {};
        }
      })();

      const insecureSourceMessage = 'Insecure Source URI';
      if (line.indexOf(insecureSourceMessage) > -1) {
        results.low(insecureSourceMessage, line);
      }
    });
  };

  self.run = function(results, done) {
    const auditCommand = 'bundle-audit';

    options.exec.command(auditCommand, {
      cwd: fileManager.target
    }, (err, data) => {
      const result = data.stdout.toString();
      resultParser(result, results);
      done();
    });
  };

  return Object.freeze(self);
};
