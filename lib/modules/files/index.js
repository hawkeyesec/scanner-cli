'use strict';
const path = require('path');
const recursive = require('recursive-readdir');
const util = require('../../util');

module.exports = function Files(options) {
  options = util.defaultValue(options);
  options = util.permittedArgs(options, ['patterns']);

  let self = {};
  self.key = 'files';
  self.name = 'Secret Files';
  self.description = 'Scans for known secret files';
  self.enabled = true;

  let targetRegexp, target;

  let makeExactMatcher = pattern => {
    return file => {
      return (file === pattern.pattern);
    };
  };

  let makeRegexMatcher = pattern => {
    return file => {
      return (pattern.pattern.exec(file) !== null);
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
    let filepath = file.replace(targetRegexp, '');

    switch(part) {
      case 'filename':
        return filename;
      case 'extension':
        return extension;
      case 'path':
        return filepath;
      default:
        console.log('Unknown part: ' + part);
    }
  };

  self.handles = function(t) {
    util.enforceNotEmpty(t);
    target = t;
    targetRegexp = new RegExp('^' + target + '\/?');
    return true;
  };

  self.run = function(results, done) {
    let patterns = util.defaultValue(options.patterns, () => { return path.join(__dirname, './data'); });
    patterns = require(patterns);
    patterns.forEach(pattern => {
      pattern.matcher = makeMatcher(pattern);
      pattern.check = file => {
        let data = extractData(pattern.part, file);
        let result = pattern.matcher(data);
        if(result === true) {
          let name = file.replace(targetRegexp, '');
          let message = pattern.caption;
          if(pattern.description) {
            message = message + '\n' + pattern.description;
          }
          results[pattern.level](name, message, pattern);
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
