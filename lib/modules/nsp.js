'use strict';
const fs = require('fs');
const path = require('path');
const exec = new require('../exec')();

module.exports = function Nsp(target) {
  let self = {};
  self.key = 'nsp';
  self.name = 'Node Security Project';
  self.description = 'Scans a package.json for known vulnerabilities from NSP';

  let getHandlerForCvssScore = (results, score) => {
    /* jshint maxcomplexity: 5*/
    if(score >= 8) {
      return results.critical;
    } else if(score >= 6 && score < 8) {
      return results.high;
    } else if(score => 4 && score < 6) {
      return results.medium;
    } else {
      return results.low;
    }
  };

  self.handles = function() {
    return fs.existsSync(path.join(target, 'package.json'));
  };
  self.run = function(results, done) {
    let nspCommand = path.join(__dirname, '../../node_modules/nsp/bin/nsp') + ' check -o json';
    exec.command(nspCommand, {}, (err, data) => {
      if(data.stderr.length === 0) { return done(); }
      let output = JSON.parse(data.stderr);
      output.forEach(result => {
        /* jshint camelcase: false */
        let key = 'nsp-cvss';
        let name = result.module;
        let description = result.advisory + '\n' + result.path.join(' > ');
        getHandlerForCvssScore(results, result.cvss_score)(key, name, description, result);
      });
      done();
    });
  };
  return Object.freeze(self);
};
