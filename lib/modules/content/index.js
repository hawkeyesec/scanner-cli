'use strict';
const path = require('path');
const async = require('async');
const util = require('../../util');

module.exports = function FileContent(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['patterns']);
  options.patterns = util.defaultValue(options.patterns, () => { return path.join(__dirname, './data'); });

  let self = {};
  self.key = 'contents';
  self.name = 'File Contents';
  self.description = 'Scans files for dangerous content';
  self.enabled = true;
  let fileManager;

  let makeContentMatcher = pattern => {
    return item => {
      let rx = pattern.exec(item);
      let result = (rx !== null);
      let line = 0;
      if(result === true) {
        line = item.split(rx[0])[0].split('\n').length;
      }
      return {
        isMatch: result,
        line: line
      };
    };
  };

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return true;
  };

  self.run = function(results, done) {
    let patterns = require(options.patterns);

    (function buildPatternChecks() {
      patterns.forEach(pattern => {
        pattern.contentMatcher = makeContentMatcher(pattern.content);
        pattern.check = (file, content) => {
          let result = pattern.contentMatcher(content);
          if(result.isMatch === true) {
            let message = pattern.caption + '\nLine number: ' + result.line;
            results[pattern.level](file, message, pattern);
          }
        };
      });
    })();

    (function executeChecksAgainstFiles() {
      async.eachSeries(patterns, (pattern, nextPattern) => {
        async.eachSeries(fileManager.byExtensions(pattern.extension), (file, nextFile) => {
          fileManager.readFile(file, (err, contents) => {
            if(err) { return nextFile(); }
            pattern.check(file, contents);
            nextFile();
          });
        }, nextPattern);
      }, done);
    })();

  };
  return Object.freeze(self);
};
