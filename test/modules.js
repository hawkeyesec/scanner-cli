'use strict';
const glob = require('glob');
const path = require('path');
require('should');

describe('Modules', () => {
  glob.sync(path.join(__dirname, '../lib/modules/*.js')).forEach(file => {
    describe(file, () => {
      let module;
      before(() => {
        module = new require(file)({
          target: path.join(__dirname, '../samples/nodejs')
        });
      });
      it('should have the module signature', () => {
        let expectMethods = ['key', 'name', 'description', 'handles', 'run', 'enabled'].sort();
        Object.keys(module).sort().should.eql(expectMethods);
      });
    });
  });
});
