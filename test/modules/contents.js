'use strict';
const Contents = require('../../lib/modules/content');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('Contents', () => {
  let contents, mockResults;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    contents = new Contents({
      patterns: path.join(__dirname, '../samples/contents.js')
    });
    should(contents.handles(path.join(__dirname, '../samples/nodejs'))).eql(true);
  });

  it('should match RSA private keys', done => {
    contents.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('some_file_with_private_key_in.md');
      done();
    });
  });
});
