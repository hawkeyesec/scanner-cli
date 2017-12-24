'use strict';
const Contents = require('../../lib/modules/contents');
const deride = require('deride');
const path = require('path');
const should = require('should');
const FileManager = require('../../lib/fileManager');

describe('Contents', () => {
  let contents, mockResults, fileManager;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    const nullLogger = deride.stub(['log', 'debug', 'error']);

    contents = new Contents({
      patterns: path.join(__dirname, '../samples/contents.js')
    });
    fileManager = deride.wrap(new FileManager({
      target: path.join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    }));

    should(contents.handles(fileManager)).eql(true);
  });

  it('should match RSA private keys', done => {
    mockResults.setup.critical.toDoThis(data => {
      should(data.offender).eql('some_file_with_private_key_in.md');
    });
    contents.run(mockResults, done);
  });

  it('should not explode when there are more than 115 files', done => {
    for(var x = 0; x < 3000; x++) {
      fileManager.languageFiles.push(fileManager.languageFiles[1]);
    }
    contents.run(mockResults, done);
  });
});
