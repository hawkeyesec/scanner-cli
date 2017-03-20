'use strict';
const fs = require('fs');
const path = require('path');
const util = require('./util');
const exec = new require('./exec')();
const logger = new require('./logger')();

module.exports = function FileManager(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['target', 'all']);
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

  const allFilesGit = dir => {
    const command = 'git ls-tree --full-tree --name-only -r HEAD';
    exec.commandSync(command, {
      cwd: dir
    }).stdout.trim().split('\n').forEach(addFile);
  };

  const gitRepo = path.join(options.target, '.git');
  if(options.all === false && fs.existsSync(gitRepo)) {
    logger.log('git repo detected, will only use git tracked files');
    allFilesGit(options.target);
  } else {
    logger.log('scanning all files in target directory');
    allFilesSync(options.target);
  }

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

  self.readFileSync = (file) => {
    if(!util.isEmpty(files[file])) { return files[file]; }
    let result = fs.readFileSync(path.join(options.target, file)).toString().trim();
    files[file] = result;
    return result;
  };

  self.readFile = (file, done) => {
    if(!util.isEmpty(files[file])) { return done(null, files[file]); }
    const absolute = path.join(options.target, file);
    fs.stat(absolute, (err, stat) => {
      if(err) { return done(err); }
      if(stat.size > 20000) { return done(null, null); }
      fs.readFile(absolute, (err, data) => {
        if(err) { return done(err); }
        const contents = data.toString().trim();
        files[file] = contents;
        return done(null, contents);
      });
    });
  };

  self.exists = file => {
    return (Object.keys(files).indexOf(file) > -1);
  };
  return Object.freeze(self);
};
