'use strict';
const path = require('path');
const recursive = require('recursive-readdir');
const fs = require('fs');
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
  let target;

  let makeExtensionMatcher = pattern => {
    return item => {
      let rx = pattern.exec(item);
      return (rx !== null);
    };
  };

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

  self.handles = function(t) {
    util.enforceNotEmpty(t);
    target = t;
    return true;
  };

  self.run = function(results, done) {
    let targetRegexp = new RegExp('^' + target + '\/?');
    let patterns = require(options.patterns);
    patterns.forEach(pattern => {
      pattern.extensionMatcher = makeExtensionMatcher(pattern.extension);
      pattern.contentMatcher = makeContentMatcher(pattern.content);
      pattern.check = (file, content) => {
        let result = pattern.contentMatcher(content);
        if(result.isMatch === true) {
          let name = file.replace(targetRegexp, '');
          let message = pattern.caption + '\nLine number: ' + result.line;
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
      async.forEach(files, (file, nextFile) => {
        let extension = file.split('.').pop();
        fs.readFile(file, (err, contents) => {
          if(err) { return nextFile(); }
          contents = contents.toString();
          async.each(patterns, (pattern, nextPattern) => {
            if(pattern.extensionMatcher(extension)) {
              pattern.check(file, contents);
            }
            nextPattern();
          }, nextFile);
        });
      }, done);
    });
  };
  return Object.freeze(self);
};
