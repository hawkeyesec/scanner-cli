'use strict';
const fs = require('fs');
const recursive = require('recursive-readdir');
const async = require('async');
const util = require('../util');

// Credit to https://gist.github.com/ppseprus/afab8500dec6394c401734cb6922d220
let Shannon = function() {
  // Create an array of character frequencies.
  const getFrequencies = str => {
    let dict = new Set(str);
    return [...dict].map(chr => {
      return str.match(new RegExp(chr, 'g')).length;
    });
  };

  let self = {};
  // Measure the entropy of a string in bits per symbol.
  self.entropy = str => getFrequencies(str)
  .reduce((sum, frequency) => {
    let p = frequency / str.length;
    return sum - (p * Math.log(p) / Math.log(2));
  }, 0);

  return Object.freeze(self);
};
const shannon = new Shannon();

module.exports = function Entropy(options) {
  util.enforceArgs(options, ['target']);

  let self = {};
  self.key = 'entropy';
  self.name = 'Entropy';
  self.description = 'Scans files for strings with high entropy';
  self.enabled = false;

  self.handles = function() {
    return true;
  };
  self.run = function(results, done) {
    let defaultFiles = /^(js|json|xml|text|rb|py|sh|md)$/;
    let targetRegexp = new RegExp('^' + options.target + '\/?');

    let imDone = false;
    recursive(options.target, ['.git', 'node_modules'], (err, files) => {
      if(imDone) { return; }
      if(err) { imDone = true; return done(err); }
      async.forEach(files, (file, nextFile) => {
        let extension = file.split('.').pop();
        if(!defaultFiles.exec(extension)) { return nextFile(); }
        fs.readFile(file, (err, contents) => {
          /* jshint maxcomplexity: 5*/
          if(err) { return nextFile(); }
          contents = contents.toString();
          let re = /\w{10,}/g;
          let m;

          do {
            m = re.exec(contents);
            if (m) {
              let word = m[0];
              let entropy = shannon.entropy(word);
              if(entropy > 4.5) {
                let name = file.replace(targetRegexp, '');
                let line = contents.split(m[0])[0].split('\n').length;
                results.low(name, 'High entropy string could be password or key\nLine number: ' + line);
              }
            }
          } while (m);

          nextFile();
        });
      }, done);
    });
  };
  return Object.freeze(self);
};
