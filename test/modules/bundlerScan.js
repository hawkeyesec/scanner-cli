'use strict';
const BundlerScan = require('../../lib/modules/bundler-scan');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');
const fs = require('fs');

describe('Bundler-scan', () => {
  let sample = fs.readFileSync(path.join(__dirname, '../samples/bundlerScan.txt'));

  let bundlerScan, mockExec, mockResults;
  beforeEach(() => {
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toCallbackWith(null, {
      stderr: sample
    });
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/ruby'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    bundlerScan = new BundlerScan({
      exec: mockExec
    });
    should(bundlerScan.handles(fileManager)).eql(true);
  });

  it('should execute bundler-audit', done => {
    bundlerScan.run(mockResults, () => {
      mockExec.expect.command.called.withArg('bundle-audit');
      done();
    });
  });

});
