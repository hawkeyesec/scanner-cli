'use strict';
const Contents = require('../../lib/modules/content');
const deride = require('deride');
const path = require('path');

describe('Contents', () => {
  let contents, mockResults;
  beforeEach(() => {
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    contents = new Contents({
      target: path.join(__dirname, '../samples/nodejs'),
      patterns: path.join(__dirname, '../samples/contents.js')
    });
  });

  it('should match RSA private keys', done => {
    contents.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('some_file_with_private_key_in.md');
      done();
    });
  });
});
