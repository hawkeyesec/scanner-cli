'use strict';
const path = require('path');
const recursive = require('recursive-readdir');

module.exports = function Nsp(target) {
  let self = {};
  self.key = 'files';
  self.name = 'Secret Files';
  self.description = 'Scans for known secret files';

  self.handles = function() {
    return true;
  };

  let makeExactMatcher = pattern => {
    return file => {
      return (file === pattern.pattern);
    };
  };

  let makeRegexMatcher = pattern => {
    return file => {
      let regex = new RegExp(pattern.pattern);
      return (regex.exec(file) !== null);
    };
  };

  let makeMatcher = pattern => {
    if(pattern.type === 'regex') {
      return makeRegexMatcher(pattern);
    }
    return makeExactMatcher(pattern);
  };

  let extractData = (part, file) => {
    /* jshint maxcomplexity: 5*/
    let filename = path.basename(file);
    let extension = filename.split('.').pop();

    switch(part) {
      case 'filename':
        return filename;
      case 'extension':
        return extension;
      case 'path':
        return file;
      default:
        console.log('Unknown part: ' + part);
    }
  };

  self.run = function(results, done) {
    let patterns = path.join(__dirname, '../../data/filename-checker-deny-patterns');
    let targetRegexp = new RegExp('^' + target + '\/?');
    patterns = require(patterns);
    patterns.forEach(pattern => {
      pattern.matcher = makeMatcher(pattern);
      pattern.check = file => {
        let data = extractData(pattern.part, file);
        let result = pattern.matcher(data);
        if(result === true) {
          results.high('files-secret', file.replace(targetRegexp, ''), pattern.caption, pattern);
        }
      };
    });

    // There is some strange bug in recursive
    // need to swap it out, it calls back multiple times on error
    let imDone = false;
    recursive(target, ['.git', 'node_modules'], (err, files) => {
      if(imDone) { return; }
      if(err) { imDone = true; return done(err); }
      files.forEach(file => {
        patterns.forEach(pattern => {
          pattern.check(file);
        });
      });
      done();
    });
  };
  return Object.freeze(self);
};
