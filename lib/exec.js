'use strict';
let spawnSync = require('child_process').spawnSync;
let spawn = require('child_process').spawn;
let util = require('./util');
let Logger = require('./logger');

require('colors');

let Exec = function(options) {
  options = util.defaultValue(options, {});
  let p = util.defaultValue(options.process, process);
  let logger = util.defaultValue(options.logger, new Logger());
  let self = {};

  let sync = (root, args, exit) => {
    /* jshint maxcomplexity: 10 */
    let proc = spawnSync(root, args);
    let stdout;
    let stderr;
    if(proc.stdout) {
      stdout = proc.stdout.toString().trim();
    }
    if(proc.stderr) {
      stderr = proc.stderr.toString().trim();
    }

    if(proc.status !== 0) {
      if(stdout) { logger.log(stdout.red); }
      if(stderr) { logger.log(stderr.red); }
      if(exit) {
        p.exitCode = 1;
        p.exit(1);
      }
    }
    return stdout;
  };

  // NOTE: Async does NOT return the result
  // It is all piped to stdout
  let async = (root, args, exit, done) => {

    let result = '';
    let err = '';
    let proc = spawn(root, args, { stdio: [
      p.stdin, 'pipe', 'pipe'
    ]});

    proc.stdout.on('data', data => {
      p.stdout.write(data.toString());
      result = result + data.toString();
    });

    proc.stderr.on('data', data => {
      p.stderr.write(data.toString().red);
      result = result + data.toString();
      err = err + data.toString();
    });

    proc.on('error', err => {
      if(exit) {
        p.exitCode = 1;
        p.exit(1);
      }
      done(err, result, 1);
    });

    proc.on('exit', code => {
      if(code !== 0 && exit) {
        p.exitCode = code;
        p.exit(code);
      }
      if(err !== '') {
        err = new Error(err);
      }
      done(err, result, code);
    });
  };

  self.commandSync = function (command, exit) {
    exit = (exit !== undefined) ? exit : true;
    let args = command.split(' ');
    let root = args.shift();
    logger.log(' ->', root.cyan, args.join(' '));
    return sync(root, args, exit);
  };

  self.command = function(command, exit, done) {
    exit = (exit !== undefined) ? exit : true;
    let args = command.split(' ');
    let root = args.shift();
    logger.log(' ->', root.cyan, args.join(' '));
    return async(root, args, exit, done);
  };

  return Object.freeze(self);
};
module.exports = Exec;
