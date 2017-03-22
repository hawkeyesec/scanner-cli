'use strict';
let Exec = require('../lib/exec');
let should = require('should');
let deride = require('deride');

describe('Exec', () => {
  let exec, proc, stderr, stdout;
  before(() => {
    stderr = deride.stub(['write']);
    stdout = deride.stub(['write']);
    proc = deride.stub(['exit']);
    proc = Object.assign({}, proc);
    proc.stdout = stdout;
    proc.stderr = stderr;
    let nullLogger = deride.stub(['log', 'error', 'debug']);
    exec = new Exec({
      process: proc,
      logger: nullLogger
    });
  });

  it('should init with default values', () => {
    let e = new Exec();
    e = undefined;
  });

  describe('Async', () => {
    it('should execute commands, and return the result', done => {
      exec.command('pwd', {}, (err, result) => {
        should(result.stdout).eql(require('process').cwd());
        done();
      });
    });
    it('should execute commands, and write them to stdout', done => {
      exec.command('pwd', { output: true }, () => {
        stdout.expect.write.called.withArg(require('process').cwd() + '\n');
        done();
      });
    });
    it('should exit the process on error', done => {
      exec.command('some-command-that-doesnt-exist', { exit: true }, () => {
        proc.expect.exit.called.withArg(1);
        done();
      });
    });
  });
});
