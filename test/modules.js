'use strict';
const glob = require('glob');
const path = require('path');
require('should');

describe('Modules', () => {
  glob.sync(path.join(__dirname, '../lib/modules/*.js')).forEach(file => {
    describe(file, () => {
      let module;
      before(() => {
        module = new require(file)(path.join(__dirname, '../samples/nodejs'));
      });
      it('should have the module signature', () => {
        Object.keys(module).sort().should.eql(['key', 'name', 'description', 'handles', 'run'].sort());
      });
    });
  });
});
