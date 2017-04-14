'use strict';
const Contents = require('../../lib/modules/content');
const deride = require('deride');
const path = require('path');
const should = require('should');
const FileManager = require('../../lib/fileManager');

describe('Contents', () => {
  let contents, mockResults;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    });

    contents = new Contents({
      patterns: path.join(__dirname, '../samples/contents.js')
    });
    should(contents.handles(fileManager)).eql(true);
  });

  it('should match RSA private keys', done => {
    mockResults.setup.critical.toDoThis(data => {
      should(data.offender).eql('some_file_with_private_key_in.md');
    });
    contents.run(mockResults, done);
  });
});
