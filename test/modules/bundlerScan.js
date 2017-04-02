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
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: sample
    });
    mockExec.setup.commandExists.toReturn(true);
    const nullLogger = deride.stub(['log', 'warn', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/ruby'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    bundlerScan = new BundlerScan({
      exec: mockExec,
      logger: nullLogger
    });
    should(bundlerScan.handles(fileManager)).eql(true);
  });

  it('should execute bundler-audit', done => {
    bundlerScan.run(mockResults, () => {
      mockExec.expect.command.called.withArg('bundle-audit');
      done();
    });
  });

  it('should report medium vulnerabilities', done => {
    bundlerScan.run(mockResults, () => {
      mockResults.expect.medium.called.withArg('actionpack', 'Denial of Service Vulnerability in Action View when using render :text', 'upgrade to >= 3.2.17', {});
      done();
    });
  });

  it('should report high vulnerabilities', done => {
    bundlerScan.run(mockResults, () => {
      mockResults.expect.high.called.withArg('actionpack', 'Ruby on Rails params_parser.rb Action Pack Type Casting Parameter Parsing Remote Code Execution', 'upgrade to ~> 2.3.15, ~> 3.0.19, ~> 3.1.10, >= 3.2.11', {});
      done();
    });
  });

  it('should report insecure gem sources', done => {
    bundlerScan.run(mockResults, () => {
      mockResults.expect.low.called.withArg('Insecure Source URI', 'Insecure Source URI found: http://rubygems.org/');
      done();
    });
  });
});
