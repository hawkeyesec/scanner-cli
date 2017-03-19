'use strict';
const async = require('async');
const util = require('../../util');
const Shannon = require('./shannon');
const shannon = new Shannon();

module.exports = function Entropy(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, []);

  let self = {};
  self.key = 'entropy';
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
    let defaultFiles = ['js', 'json', 'xml', 'text', 'rb', 'py', 'sh', 'md'];

    const checkEntropy = (file, contents, nextFile) => {
      /* jshint maxcomplexity: 5 */
      let re = /\w{10,}/g;
      let m;

      do {
        m = re.exec(contents);
        if (m) {
          let word = m[0];
          let entropy = shannon.entropy(word);
          if(entropy > 4.5) {
            let line = contents.split(m[0])[0].split('\n').length;
            results.low(file, 'High entropy string could be password or key\nLine number: ' + line);
          }
        }
      } while (m);
      nextFile();
    };

    (function executeChecksAgainstFiles() {
      async.eachSeries(fileManager.byExtensions(defaultFiles), (file, nextFile) => {
        fileManager.readFile(file, (err, contents) => {
          if(err) { return nextFile(); }
          checkEntropy(file, contents, nextFile);
        });
      }, done);
    })();

  };
  return Object.freeze(self);
};
