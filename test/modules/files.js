'use strict';
const Files = require('../../lib/modules/files');
const deride = require('deride');
const path = require('path');
const should = require('should');
const FileManager = require('../../lib/fileManager');

describe('Files', () => {
  let files, mockResults, fileManager;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    });

    files = new Files({
      patterns: path.join(__dirname, '../samples/filename.js')
    });
    should(files.handles(fileManager)).eql(true);
  });

  it('should match exact file names', done => {
    files.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('id_rsa');
      done();
    });
  });

  it('should match regex file names', done => {
    files.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('regex_rsa');
      done();
    });
  });

  it('should match exact file extensions', done => {
    files.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('cert.pem');
      done();
    });
  });

  it('should match regex file extensions', done => {
    files.run(mockResults, () => {
      mockResults.expect.high.called.withArg('keyring');
      done();
    });
  });

  it('should match regex paths', done => {
    files.run(mockResults, () => {
      mockResults.expect.medium.called.withArg('gem/credentials');
      done();
    });
  });

});
