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
  it('should not duplicate modules to run', () => {
    noRc.withModule('ncu');
    noRc.withModule('ncu');
    should(noRc.modules).eql(['ncu']);
  });

  it('should let me set the failOn level', () => {
    rc.withFailOn('high');
    should(rc.failOn).eql('high');
  });
  it('should reject bad failon levels', () => {
    should(() => {
      rc.withFailOn('bad-value');
    }).throw();
  });

  it('should let me add a sumo writer ', () => {
    rc.withSumo('http://url.com');
    should(rc.sumo).eql('http://url.com');
  });
  it('sumo writer should not allow invalid urls', () => {
    should(() => {
      rc.withSumo('bad-url');
    }).throw();
  });
  it('should let me add a json writer ', () => {
    rc.withJson('path');
    should(rc.json).eql('path');
  });
  it('should reject bad paths', () => {
    should(() => {
      rc.withJson('*!&@*$^path');
    }).throw();
  });

  it('should let me add a http writer ', () => {
    rc.withHttp('http://url.com');
    should(rc.http).eql('http://url.com');
  });
  it('http writer should not allow invalid urls', () => {
    should(() => {
      rc.withHttp('bad-url');
    }).throw();
  });

  describe('when files not present', () => {
    it('should default the excludes', () => {
      should(noRc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json']);
    });
    it('should default the modules to all', () => {
      should(noRc.modules).eql(['all']);
    });
    it('should default failOn to low', () => {
      should(noRc.failOn).eql('low');
    });
  });

  describe('when filespresent', () => {
    it('should throw an error with an unknown option', () => {
      should(() => {
        new Rc().withTarget(path.join(__dirname, 'samples/badrc'));
      }).throw();
    });
    it('should concat the excludes together', () => {
      should(rc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json', '^another/']);
    });
    it('should replace the modules', () => {
      should(rc.modules).eql(['contents', 'entropy', 'files', 'ncu', 'nsp']);
    });
    it('should replace the failOn', () => {
      should(rc.failOn).eql('medium');
    });
  });
});
