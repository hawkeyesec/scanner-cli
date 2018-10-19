'use strict'

/* eslint-disable no-unused-expressions */

const Rc = require('../rc')
const path = require('path')

describe('RC', () => {
  const target = path.join(__dirname, 'samples')
  let rc, noRc
  beforeEach(() => {
    rc = new Rc().withTarget(target)
    noRc = new Rc()
  })

  describe('withStaged', () => {
    it('should default to false', () => {
      expect(noRc.staged).to.be.false
    })
    it('should target staged files only', () => {
      noRc.withStaged()
      expect(noRc.staged).to.be.true
    })
    it('should conflict with --all', () => {
      noRc.withStaged()
      expect(() => {
        noRc.withAll()
      }).to.throw()
    })
  })

  describe('withAll', () => {
    it('should default to false', () => {
      expect(noRc.all).to.be.false
    })
    it('should read from rc file', () => {
      expect(rc.all).to.be.true
    })
    it('should target all files', () => {
      noRc.withAll()
      expect(noRc.all).to.be.true
    })
    it('should conflict with --staged', () => {
      noRc.withAll()
      expect(() => {
        noRc.withStaged()
      }).to.throw()
    })
  })

  describe('withModule', () => {
    it('should default the modules to all', () => {
      expect(noRc.modules).to.deep.equal(['all'])
    })
    it('should let me specify a module to run', () => {
      noRc.withModule('node-npmoutdated')
      expect(noRc.modules).to.deep.equal(['node-npmoutdated'])
    })
    it('should not duplicate modules to run', () => {
      noRc.withModule('node-npmoutdated')
      noRc.withModule('node-npmoutdated')
      expect(noRc.modules).to.deep.equal(['node-npmoutdated'])
    })
    it('should read from rc file', () => {
      expect(rc.modules).to.deep.equal(['contents', 'entropy', 'files', 'node-npmoutdated', 'node-npmaudit'])
    })
  })

  describe('withFailOn', () => {
    it('should default failOn to low', () => {
      expect(noRc.failOn).to.equal('low')
    })
    it('should let me set the failOn level', () => {
      noRc.withFailOn('high')
      expect(noRc.failOn).to.equal('high')
    })
    it('should reject bad failon levels', () => {
      expect(() => {
        noRc.withFailOn('bad-value')
      }).to.throw()
    })
    it('should read from rc', () => {
      expect(rc.failOn).to.equal('medium')
    })
  })

  describe('withSumo', () => {
    it('should configure writer from hawkeyerc', () => {
      expect(rc.writers.filter(w => w.key === 'writer-sumo').length === 1).to.be.true
    })
    it('should add writer ', () => {
      noRc.withSumo('http://url.com')
      const [writer] = rc.writers.filter(w => w.key === 'writer-sumo')
      expect(writer.key).to.equal('writer-sumo')
      expect(writer.opts).to.deep.equal({ url: 'http://url.com' })
    })
    it('should not allow invalid urls', () => {
      expect(() => { noRc.withSumo('bad-url') }).to.throw()
    })
  })

  describe('withJson', () => {
    it('should configure from hawkeyerc', () => {
      expect(rc.writers.filter(w => w.key === 'writer-json').length === 1).to.be.true
    })
    it('should add writer ', () => {
      noRc.withJson('path')
      const [writer] = rc.writers.filter(w => w.key === 'writer-json')
      expect(writer.key).to.equal('writer-json')
      expect(writer.opts).to.deep.equal({ file: 'path' })
    })
    it('should reject bad paths', () => {
      expect(() => { rc.withJson('*!&@*$^path') }).to.throw()
    })
  })

  describe('withHttp', () => {
    it('should configure writer from hawkeyerc', () => {
      expect(rc.writers.filter(w => w.key === 'writer-http').length === 1).to.be.true
    })
    it('should add writer ', () => {
      noRc.withHttp('http://url.com')
      const [writer] = rc.writers.filter(w => w.key === 'writer-http')
      expect(writer.key).to.equal('writer-http')
      expect(writer.opts).to.deep.equal({ url: 'http://url.com' })
    })
    it('should not allow invalid urls', () => {
      expect(() => { noRc.withHttp('bad-url') }).to.throw()
    })
  })

  describe('withShowCode', () => {
    it('should default to false', () => {
      expect(noRc.showCode).to.be.false
    })
    it('should toggle', () => {
      noRc.withShowCode()
      expect(noRc.showCode).to.be.true
    })
    it('should read from .hawkeyerc', () => {
      expect(rc.showCode).to.be.true
    })
  })

  describe('withExclude', () => {
    it('should default the excludes', () => {
      expect(noRc.exclude).to.deep.equal([/^node_modules\//, /^.git\//, /^package-lock.json/])
    })
    it('should exclude files from CLI', () => {
      noRc.withExclude('^another/')
      expect(noRc.exclude).to.deep.equal([/^node_modules\//, /^.git\//, /^package-lock.json/, /^another\//])
    })
    it('should concat the excludes together', () => {
      expect(rc.exclude).to.deep.equal([/^node_modules\//, /^.git\//, /^package-lock.json/, /^another\//])
    })
  })

  describe('parseRc', () => {
    it('should throw an error with an unknown option', () => {
      expect(() => {
        new Rc().withTarget(path.join(__dirname, 'samples/badrc'))
      }).to.throw()
    })
  })
})
