'use strict';
const fs = require('fs');
const path = require('path');
const util = require('./util');

module.exports = function FileManager(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['target', 'all', 'logger', 'exclude']);
  options.exclude = util.defaultValue(options.exclude, []);
  const logger = util.defaultValue(options.logger, () => { return new require('./logger')(); });
  const exec = new require('./exec')({ logger:logger });
  logger.log('Exclusion patterns:', options.exclude.join(', '));
  options.exclude = options.exclude.map(e => {
    return new RegExp(e);
  });

  util.enforceArgs(options, ['target', 'exclude']);
  const self = {
    target: options.target,
    targetRegex: new RegExp(`^${options.target}/?`)
  };
  const files = {};


  const addFile = file => {
    files[file] = null;
  };

  const allFilesSync = dir => {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = filePath.replace(self.targetRegex, '');

      if(fs.statSync(filePath).isDirectory()) {
        return allFilesSync(filePath);
      }
      addFile(relativePath);
    });
  };

  const gatherEncryptedFiles = dir => {
    let encrypted = [];

    if(fs.existsSync(path.join(dir, '.git-crypt'))) {
      logger.log('git-crypt detected, excluding files covered by GPG encryption');
      let stdout = exec.commandSync('git-crypt status -e', {
        cwd: dir
      }).stdout;
      if(stdout.length > 0) {
        encrypted = stdout.split('\n').map(f => {
          return f.split('encrypted: ').slice(-1)[0];
        });
      }
      logger.log('Files excluded by git-crypt:', encrypted.length);
    }
    return encrypted;
  };

  const allFilesGit = dir => {
    let encrypted = gatherEncryptedFiles(dir);
    const command = 'git ls-tree --full-tree --name-only -r HEAD';
    return exec.commandSync(command, {
      cwd: dir
    }).stdout.trim().split('\n').filter(f => {
      return encrypted.indexOf(f) === -1;
    }).forEach(addFile);
  };
  const gitRepo = path.join(options.target, '.git');
  if(options.all === false && fs.existsSync(gitRepo)) {
    logger.log('git repo detected, will only use git tracked files');
    allFilesGit(options.target);
  } else {
    logger.log('scanning all files in target directory');
    allFilesSync(options.target);
  }

  const isExcluded = file => {
    let excluded = false;
    options.exclude.forEach(exclusion => {
      const result = exclusion.exec(file);
      if(result !== null) {
        logger.debug(file, 'was excluded by regex', result[0]);
        excluded = true;
        return;
      }
    });
    return excluded;
  };

  let excluded = Object.keys(files).filter(file => {
    return isExcluded(file);
  });
  logger.log('Files excluded by exclusion patterns:', Object.keys(excluded).length);
  excluded.forEach(e => {
    delete files[e];
  });

  logger.log('Files included in scan:', Object.keys(files).length);

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
    const result = fs.readFileSync(path.join(options.target, file)).toString().trim();
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
