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
    mockResults.setup.critical.toDoThis(data => {
      if(data.offender === 'id_rsa') { done(); }
    });
    files.run(mockResults);
  });

  it('should match regex file names', done => {
    mockResults.setup.critical.toDoThis(data => {
      if(data.offender === 'regex_rsa') { done(); }
    });
    files.run(mockResults);
  });

  it('should match exact file extensions', done => {
    mockResults.setup.critical.toDoThis(data => {
      if(data.offender === 'cert.pem') { done(); }
    });
    files.run(mockResults);
  });

  it('should match regex file extensions', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.offender).eql('keyring');
    });
    files.run(mockResults, done);
  });

  it('should match regex paths', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(data.offender).eql('gem/credentials');
    });
    files.run(mockResults, done);
  });

});
