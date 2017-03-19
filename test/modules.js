'use strict';
const glob = require('glob');
const path = require('path');
require('should');

describe('Modules', () => {
  let pathToModules = path.join(__dirname, '../lib/modules/*/**/index.js');
  let files = glob.sync(pathToModules);

  files.forEach(file => {
    describe(file, () => {
      let module;
      before(() => {
        module = new require(file)();
      });
      it('should have the module signature', () => {
        let expectMethods = ['key', 'name', 'description', 'handles', 'run', 'enabled'].sort();
        Object.keys(module).sort().should.eql(expectMethods);
      });
    });
  });
});
