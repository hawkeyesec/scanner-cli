'use strict';
require('should');
const deride = require('deride');

describe('Modules', () => {
  new require('../lib/modules')({
    logger: deride.stub(['log'])
  }).asArray.forEach(module => {
    describe(module.name, () => {
      it('should have the module signature', () => {
        let expectMethods = ['key', 'name', 'description', 'handles', 'run', 'enabled'].sort();
        Object.keys(module).sort().should.eql(expectMethods);
      });
    });
  });
});
