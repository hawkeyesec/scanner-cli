'use strict'
const Rc = require('../rc')
const path = require('path')
const should = require('should')

describe('RC', () => {
  const target = path.join(__dirname, 'samples')
  let rc, noRc
  beforeEach(() => {
    rc = new Rc().withTarget(target)
    noRc = new Rc()
  })

  describe('withModule', () => {
    it('should let me specify a module to run', () => {
      noRc.withModule('node-npmoutdated')
      should(noRc.modules).eql(['node-npmoutdated'])
    })
    it('should not duplicate modules to run', () => {
      noRc.withModule('node-npmoutdated')
      noRc.withModule('node-npmoutdated')
      should(noRc.modules).eql(['node-npmoutdated'])
    })
  })

  describe('withFailOn', () => {
    it('should let me set the failOn level', () => {
      rc.withFailOn('high')
      should(rc.failOn).eql('high')
    })
    it('should reject bad failon levels', () => {
      should(() => {
        rc.withFailOn('bad-value')
      }).throw()
    })
  })

  describe('withSumo', () => {
    it('should let me add a sumo writer ', () => {
      rc.withSumo('http://url.com')
      should(rc.sumo).eql('http://url.com')
    })
    it('sumo writer should not allow invalid urls', () => {
      should(() => {
        rc.withSumo('bad-url')
      }).throw()
    })
  })

  describe('withJson', () => {
    it('should let me add a json writer ', () => {
      rc.withJson('path')
      should(rc.json).eql('path')
    })
    it('should reject bad paths', () => {
      should(() => {
        rc.withJson('*!&@*$^path')
      }).throw()
    })
  })

  describe('withHttp', () => {
    it('should let me add a http writer ', () => {
      rc.withHttp('http://url.com')
      should(rc.http).eql('http://url.com')
    })
    it('http writer should not allow invalid urls', () => {
      should(() => {
        rc.withHttp('bad-url')
      }).throw()
    })
  })

  describe('withFileLimit', () => {
    it('should let me set the file limit using setter', () => {
      rc.withFileLimit(2000)
      should(rc.fileLimit).eql(2000)
    })
    it('withFileLimit should not allow negative number', () => {
      should(() => {
        rc.withFileLimit(-2)
      }).throw()
    })
    it('withFileLimit should not allow undefined', () => {
      should(() => {
        rc.withFileLimit(undefined)
      }).throw()
    })
  })

  describe('when files not present', () => {
    it('should default the excludes', () => {
      should(noRc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json'])
    })
    it('should default the modules to all', () => {
      should(noRc.modules).eql(['all'])
    })
    it('should default failOn to low', () => {
      should(noRc.failOn).eql('low')
    })
  })

  describe('when files present', () => {
    it('should throw an error with an unknown option', () => {
      should(() => {
        new Rc().withTarget(path.join(__dirname, 'samples/badrc'))
      }).throw()
    })
    it('should concat the excludes together', () => {
      should(rc.exclude).eql(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json', '^another/'])
    })
    it('should replace the modules', () => {
      should(rc.modules).eql(['contents', 'entropy', 'files', 'node-npmoutdated', 'node-npmaudit'])
    })
    it('should replace the failOn', () => {
      should(rc.failOn).eql('medium')
    })
  })
})
