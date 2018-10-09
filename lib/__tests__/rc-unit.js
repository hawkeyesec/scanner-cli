'use strict'
const Rc = require('../rc')
const path = require('path')

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
      expect(noRc.modules).to.deep.equal(['node-npmoutdated'])
    })
    it('should not duplicate modules to run', () => {
      noRc.withModule('node-npmoutdated')
      noRc.withModule('node-npmoutdated')
      expect(noRc.modules).to.deep.equal(['node-npmoutdated'])
    })
  })

  describe('withFailOn', () => {
    it('should let me set the failOn level', () => {
      rc.withFailOn('high')
      expect(rc.failOn).to.equal('high')
    })
    it('should reject bad failon levels', () => {
      expect(() => {
        rc.withFailOn('bad-value')
      }).to.throw()
    })
  })

  describe('withSumo', () => {
    it('should let me add a sumo writer ', () => {
      rc.withSumo('http://url.com')
      expect(rc.sumo).to.equal('http://url.com')
    })
    it('sumo writer should not allow invalid urls', () => {
      expect(() => {
        rc.withSumo('bad-url')
      }).to.throw()
    })
  })

  describe('withJson', () => {
    it('should let me add a json writer ', () => {
      rc.withJson('path')
      expect(rc.json).to.equal('path')
    })
    it('should reject bad paths', () => {
      expect(() => {
        rc.withJson('*!&@*$^path')
      }).to.throw()
    })
  })

  describe('withHttp', () => {
    it('should let me add a http writer ', () => {
      rc.withHttp('http://url.com')
      expect(rc.http).to.equal('http://url.com')
    })
    it('http writer should not allow invalid urls', () => {
      expect(() => {
        rc.withHttp('bad-url')
      }).to.throw()
    })
  })

  describe('withFileLimit', () => {
    it('should let me set the file limit using setter', () => {
      rc.withFileLimit(2000)
      expect(rc.fileLimit).to.equal(2000)
    })
    it('withFileLimit should not allow negative number', () => {
      expect(() => {
        rc.withFileLimit(-2)
      }).to.throw()
    })
    it('withFileLimit should not allow undefined', () => {
      expect(() => {
        rc.withFileLimit(undefined)
      }).to.throw()
    })
  })

  describe('when files not present', () => {
    it('should default the excludes', () => {
      expect(noRc.exclude).to.deep.equal(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json'])
    })
    it('should default the modules to all', () => {
      expect(noRc.modules).to.deep.equal(['all'])
    })
    it('should default failOn to low', () => {
      expect(noRc.failOn).to.equal('low')
    })
  })

  describe('when files present', () => {
    it('should throw an error with an unknown option', () => {
      expect(() => {
        new Rc().withTarget(path.join(__dirname, 'samples/badrc'))
      }).to.throw()
    })
    it('should concat the excludes together', () => {
      expect(rc.exclude).to.deep.equal(['^node_modules/', '^.git/', '^.git-crypt/', 'package-lock.json', '^another/'])
    })
    it('should replace the modules', () => {
      expect(rc.modules).to.deep.equal(['contents', 'entropy', 'files', 'node-npmoutdated', 'node-npmaudit'])
    })
    it('should replace the failOn', () => {
      expect(rc.failOn).to.equal('medium')
    })
  })
})
