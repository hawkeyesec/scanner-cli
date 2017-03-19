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
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs')
    });

    contents = new Contents({
      patterns: path.join(__dirname, '../samples/contents.js')
    });
    should(contents.handles(fileManager)).eql(true);
  });

  it('should match RSA private keys', done => {
    contents.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('some_file_with_private_key_in.md');
      done();
    });
  });
});
