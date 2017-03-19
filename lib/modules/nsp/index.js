'use strict';
const fs = require('fs');
const path = require('path');
const util = require('../../util');

module.exports = function Nsp(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  let self = {};
  self.key = 'nsp';
  self.name = 'Node Security Project';
  self.description = 'Scans a package.json for known vulnerabilities from NSP';
  self.enabled = true;

  let getHandlerForCvssScore = (results, score) => {
    /* jshint maxcomplexity: 5*/
    if(score >= 8) {
      return results.critical;
    } else if(score >= 6 && score < 8) {
      return results.high;
    } else if(score >= 4 && score < 6) {
      return results.medium;
    } else {
      return results.low;
    }
  };

  let pathToJson, fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    pathToJson = path.join(fileManager.target, 'package.json');
    return fs.existsSync(pathToJson);
  };

  self.run = function(results, done) {
    let nspCommand = path.join(__dirname, '../../../node_modules/nsp/bin/nsp') + ' check -o json';

    options.exec.command(nspCommand, {
      cwd: path.dirname(pathToJson)
    }, (err, data) => {
      if(data.stderr.length === 0) { return done(); }
      let output = JSON.parse(data.stderr);
      output.forEach(result => {
        /* jshint camelcase: false */
        let name = result.module;
        let description = result.advisory + '\n' + result.path.join(' > ');
        getHandlerForCvssScore(results, result.cvss_score)(name, description, result);
      });
      done();
    });
  };
  return Object.freeze(self);
};
