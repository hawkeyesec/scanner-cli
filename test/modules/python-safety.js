'use strict';
const Safety = require('../../lib/modules/python-safety');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');
const fs = require('fs');

describe('Safety', () => {
  let safety, mockExec, mockResults, fileManager, mockLogger;
  let sample = fs.readFileSync(path.join(__dirname, '../samples/safety.json'), 'utf-8');

  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: sample
    });
    mockExec.setup.commandExists.toReturn(true);

    const nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/python'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    mockLogger = deride.stub(['warn']);

    safety = new Safety({
      exec: mockExec,
      logger: mockLogger
    });
    should(safety.handles(fileManager)).eql(true);
  });

  it('should execute safety check --json -r requirements.txt', done => {
    safety.run(mockResults, () => {
      mockExec.expect.command.called.withArg('safety check --json -r requirements.txt');
      done();
    });
  });

  it('should pass the whole advisory back as data', done => {
    safety.run(mockResults, () => {
      mockResults.expect.high.called.twice();
      done();
    });
  });

  it('should parse the advisory properly', done => {
    safety.run(mockResults, () => {
      const item = {
         code:'25853',
         offender:'insecure-package 0.1',
         description: 'This is an insecure package with lots of exploitable security vulnerabilities.',
         mitigation: 'Versions <0.2.0 are vulnerable. Update to a non vulnerable version.'
      };

      mockResults.expect.high.called.withArgs(item);
      done();
    });
  });

  it('should log warning regarding unpinned dependencies', done => {
    safety.run(mockResults, () => {});

    mockLogger.expect.warn.called.withArgs('Warning: unpinned requirement \'requests\' found, unable to check.');
    mockLogger.expect.warn.called.withArgs('Warning: unpinned requirement \'cryptography\' found, unable to check.');
    mockLogger.expect.warn.called.withArgs('Warning: unpinned requirement \'django\' found, unable to check.');

    done();
  });

  it('should not run safety if not installed', done => {
    const mockExec = deride.stub(['commandExists']);
    const mockLogger = deride.stub(['warn']);
    mockExec.setup.commandExists.toReturn(false);

    const safety = new Safety({
      exec: mockExec,
      logger: mockLogger
    });

    should(safety.handles(fileManager)).eql(false);
    mockLogger.expect.warn.called.withArgs('requirements.txt found but safety not found in $PATH');
    mockLogger.expect.warn.called.withArgs('python-safety will not run unless you install safety');
    mockLogger.expect.warn.called.withArgs('Please see: https://github.com/pyupio/safety');
    done();
  });

});
