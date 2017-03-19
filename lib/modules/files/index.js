'use strict';
const path = require('path');
const util = require('../../util');
const async = require('async');

module.exports = function Files(options) {
  options = util.defaultValue(options);
  options = util.permittedArgs(options, ['patterns', 'fileManager']);

  let self = {};
  self.key = 'files';
  self.name = 'Secret Files';
  self.description = 'Scans for known secret files';
  self.enabled = true;

  let fileManager;

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

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
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
          let message = pattern.caption;
          if(pattern.description) {
            message = message + '\n' + pattern.description;
          }
          results[pattern.level](file, message, pattern);
        }
      };
    });

    let files = fileManager.all();
    async.each(files, (file, next) => {
      patterns.forEach(pattern => {
        pattern.check(file);
      });
      next();
    }, done);

  };
  return Object.freeze(self);
};
