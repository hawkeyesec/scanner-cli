'use strict';
const Files = require('../../lib/modules/files');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('Files', () => {
  let files, mockResults;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    files = new Files({
      patterns: path.join(__dirname, '../samples/filename.js')
    });
    should(files.handles(path.join(__dirname, '../samples/nodejs'))).eql(true);
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
