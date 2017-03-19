'use strict';
let spawn = require('child_process').spawn;
let util = require('./util');
let Logger = require('./logger');

require('colors');

let Exec = function(options) {
  options = util.defaultValue(options, {});
  let p = util.defaultValue(options.process, process);
  let logger = util.defaultValue(options.logger, new Logger());
  let self = {};

  let async = (root, args, options, done) => {

    let stdout = '';
    let stderr = '';
    let spawnOpts = {
      stdio: [
        p.stdin, 'pipe', 'pipe'
      ]
    };
    if(options.cwd) {
      spawnOpts.cwd = options.cwd;
    }
    let proc = spawn(root, args, spawnOpts);

    proc.stdout.on('data', data => {
      if(options.output) { p.stdout.write(data.toString()); }
      stdout = stdout + data.toString();
    });

    proc.stderr.on('data', data => {
      if(options.output) { p.stderr.write(data.toString().red); }
      stderr = stderr + data.toString();
    });

    proc.on('error', err => {
      if(options.exit) {
        p.exitCode = 1;
        p.exit(1);
      }
      done(err, {
        stdout: stdout,
        stderr: stderr
      }, 1);
    });

    proc.on('exit', code => {
      if(code !== 0 && options.exit) {
        p.exitCode = code;
        p.exit(code);
      }

      done(null, {
        stdout: stdout,
        stderr: stderr,
        code: code
      });
    });
  };

  self.command = function(command, options, done) {
    options = util.defaultValue(options, {});
    options.exit = util.defaultValue(options.exit, false);
    options.output = util.defaultValue(options.output, false);
    let args = command.split(' ');
    let root = args.shift();
    logger.log(' ->', root.cyan, args.join(' '));
    return async(root, args, options, done);
  };

  return Object.freeze(self);
};
module.exports = Exec;
