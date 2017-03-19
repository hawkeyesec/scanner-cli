'use strict';
const fs = require('fs');
const path = require('path');
const util = require('./util');

module.exports = function FileManager(options) {
  options = util.defaultValue(options, {});
  options.globalExclusions = util.defaultValue(options.globalExclusions, [
    'node_modules',
    '.git'
  ]);
  const globalExclusionsRegex = new RegExp(`(${options.globalExclusions.join('|')})`);

  util.enforceArgs(options, ['target', 'globalExclusions']);
  let self = {
    target: options.target,
    targetRegex: new RegExp(`^${options.target}/?`)
  };
  let files = {};

  const addFile = file => {
    files[file] = null;
  };

  const allFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = filePath.replace(self.targetRegex, '');
      if(globalExclusionsRegex.exec(relativePath) !== null) { return; }
      if(fs.statSync(filePath).isDirectory()) {
        return allFilesSync(filePath);
      }
      addFile(relativePath);
    });
  };
  allFilesSync(options.target);

  self.all = () => {
    return Object.keys(files);
  };

  self.excludeExtensions = args => {
    return self.byExtensions(args, true);
  };

  self.excludePaths = args => {
    return self.byPaths(args, true);
  };

  self.byPaths = (args, invert = false) => {
    args = (args instanceof Array) ? args : [args];
    const pathRegex = `^${args.join('|')}/.*$`;
    const filterRegex = new RegExp(pathRegex);
    return Object.keys(files).filter(file => {
      const result = (filterRegex.exec(file) !== null);
      return (invert ? !result : result);
    });
  };

  self.byExtensions = (args, invert = false) => {
    args = (args instanceof Array) ? args : [args];
    const extensionRegex = `\.(${args.join('|')})$`;
    const filterRegex = new RegExp(extensionRegex);
    return Object.keys(files).filter(file => {
      const result = (filterRegex.exec(file) !== null);
      return (invert ? !result : result);
    });
  };

  self.readFile = (file, done) => {
    if(!util.isEmpty(files[file])) { return done(null, files[file]); }
    fs.readFile(path.join(options.target, file), (err, data) => {
      if(err) { return done(err); }
      const contents = data.toString().trim();
      files[file] = contents;
      return done(null, contents);
    });
  };

  return Object.freeze(self);
};
