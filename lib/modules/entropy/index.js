'use strict';
const async = require('async');
const util = require('../../util');
const Shannon = require('./shannon');
const shannon = new Shannon();

module.exports = function Entropy(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, []);

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Entropy';
  self.description = 'Scans files for strings with high entropy';
  self.enabled = false;

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return true;
  };

  self.run = function(results, done) {
    const checkEntropy = (file, contents, nextFile) => {
      /* jshint maxcomplexity: 5 */
      const re = /\w{10,}/g;
      let m;

      do {
        m = re.exec(contents);
        if (m) {
          const word = m[0];
          const entropy = shannon.entropy(word);
          if(entropy > 4.5) {
            const line = contents.split(m[0])[0].split('\n').length;
            const item = {
              code: '1',
              offender: file,
              description: 'High entropy string detected in file',
              mitigation: 'Check line number: ' + line,
              data: {}
            };

            results.low(item);
          }
        }
      } while (m);
      async.setImmediate(nextFile);
    };

    (function executeChecksAgainstFiles() {
      async.eachSeries(fileManager.languageFiles, (file, nextFile) => {
        fileManager.readFile(file, (err, contents) => {
          if(err) { return nextFile(); }
          checkEntropy(file, contents, nextFile);
        });
      }, done);
    })();

  };
  return Object.freeze(self);
};
