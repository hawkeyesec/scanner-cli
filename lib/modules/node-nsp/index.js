'use strict';
const path = require('path');
const util = require('../../util');

module.exports = function Nsp(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Node Security Project';
  self.description = 'Scans a package.json for known vulnerabilities from NSP';
  self.enabled = true;

  const getHandlerForCvssScore = (results, score) => {
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

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return fileManager.exists('package.json');
  };

  /* jshint maxcomplexity: 6 */
  self.run = function(results, done) {
    const nspCommand = path.join(util.moduleResolve('nsp'), 'bin/nsp') + ' check --reporter json';
    options.exec.command(nspCommand, {
      cwd: fileManager.target
    }, (err, data) => {
      if(err) { return done(err); }
      if(!util.isEmpty(err)) {
        return done(err);
      }
      if(!data.stderr || data.stderr.length === 0) { return done(); }
      let output;
      try {
        output = JSON.parse(data.stderr);
      } catch(ex) {
        return done(new Error('Failed to parse output: ' + data.stderr));
      }
      output.forEach(result => {
        /* jshint camelcase: false */
        result.path.shift();

        const item = {
          code: result.id,
          offender: result.module,
          description: result.title,
          mitigation: result.advisory,
          data: result
        };

        getHandlerForCvssScore(results, result.cvss_score)(item);
      });
      done();
    });
  };
  return Object.freeze(self);
};
