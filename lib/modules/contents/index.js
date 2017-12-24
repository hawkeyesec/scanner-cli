'use strict';
const path = require('path');
const async = require('async');
const util = require('../../util');

module.exports = function FileContent(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['patterns']);
  options.patterns = util.defaultValue(options.patterns, () => { return path.join(__dirname, './data'); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'File Contents';
  self.description = 'Scans files for dangerous content';
  self.enabled = true;
  let fileManager;

  const makeContentMatcher = pattern => {
    return item => {
      const rx = pattern.exec(item);
      const result = (rx !== null);
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
    const patterns = require(options.patterns);
    (function buildPatternChecks() {
      patterns.forEach(pattern => {
        pattern.contentMatcher = makeContentMatcher(pattern.content);
        pattern.check = (file, content) => {
          const result = pattern.contentMatcher(content);
          if(result.isMatch === true) {
            const message = pattern.caption;
            const mitigation = 'Check line number: ' + result.line;
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
    })();

    (function executeChecksAgainstFiles() {
      const checkPatternAgainstFiles = (pattern, nextPattern) => {
        const checkPatternAgainstLanguageFile = (file, nextFile) => {
          const validateFileContents = (err, contents) => {
            if(err) { return nextFile(); }
            pattern.check(file, contents);
            async.setImmediate(nextFile);
          };
          fileManager.readFile(file, validateFileContents);
        };
        async.eachSeries(fileManager.languageFiles, checkPatternAgainstLanguageFile, nextPattern);
      };
      async.eachSeries(patterns, checkPatternAgainstFiles, done);
    })();

  };
  return Object.freeze(self);
};
