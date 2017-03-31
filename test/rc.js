'use strict';
const Rc = require('../lib/rc');
const path = require('path');
const should = require('should');
const deride = require('deride');

describe('RC', () => {
  const target = path.join(__dirname, 'samples');
  const nullLogger = deride.stub(['log', 'debug', 'error']);
  let rc, noRc;
  beforeEach(() => {
    rc = new Rc({ logger: nullLogger }).withTarget(target);
    noRc = new Rc({ logger: nullLogger });
  });

  it('should let me specify a module to run', () => {
    noRc.withModule('ncu');
    should(noRc.modules).eql(['ncu']);
  });


  it('should let me set the failOn level', () => {
    rc.withFailOn('high');
    should(rc.failOn).eql('high');
  });

  describe('when files not present', () => {
    it('should default the excludes', () => {
      should(noRc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/']);
    });
    it('should default the modules to all', () => {
      should(noRc.modules).eql(['all']);
    });
    it('should default failOn to low', () => {
      should(noRc.failOn).eql('low');
    });
  });

  describe('when filespresent', () => {
    it('should concat the excludes together', () => {
      should(rc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/', '^another/']);
    });
    it('should replace the modules', () => {
      should(rc.modules).eql(['contents', 'entropy', 'files', 'ncu', 'nsp']);
    });
    it('should replace the failOn', () => {
      should(rc.failOn).eql('medium');
    });
  });
});
