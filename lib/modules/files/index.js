'use strict';
const path = require('path');
const util = require('../../util');
const async = require('async');

module.exports = function Files(options) {
  options = util.defaultValue(options);
  options = util.permittedArgs(options, ['patterns', 'fileManager']);

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Secret Files';
  self.description = 'Scans for known secret files';
  self.enabled = true;

  let fileManager;

  const makeExactMatcher = pattern => {
    return file => {
      return (file === pattern.pattern);
    };
  };

  const makeRegexMatcher = pattern => {
    return file => {
      return (pattern.pattern.exec(file) !== null);
    };
  };

  const makeMatcher = pattern => {
    if(pattern.type === 'regex') {
      return makeRegexMatcher(pattern);
    }
    return makeExactMatcher(pattern);
  };

  const extractData = (part, file) => {
    /* jshint maxcomplexity: 5*/
    const filename = path.basename(file);
    const extension = filename.split('.').pop();

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
        const data = extractData(pattern.part, file);
        const result = pattern.matcher(data);
        if(result === true) {
          let message = pattern.caption;
          const mitigation = util.defaultValue(pattern.description, 'Check contents of the file');
          const item = {
            code: pattern.code,
            offender: file,
            description: message,
            mitigation: mitigation,
            data: pattern
          };
          results[pattern.level](item);
        }
      };
    });

    const files = fileManager.all();
    async.each(files, (file, next) => {
      patterns.forEach(pattern => {
        pattern.check(file);
      });
      next();
    }, done);

  };
  return Object.freeze(self);
};
