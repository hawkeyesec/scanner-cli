'use strict'
/* eslint-disable no-unused-expressions */

let util = require('../util')

describe('Util', () => {
  describe('Args', () => {
    it('should enforce an arg', () => {
      expect(() => {
        util.enforceArgs({}, 'test')
      }).to.throw(/is a required argument/)
    })
    it('should enforce args', () => {
      expect(() => {
        util.enforceArgs({}, ['test', 'test2'])
      }).to.throw(/is a required argument/)
    })
    it('not throw if its ok', () => {
      expect(() => {
        util.enforceArgs({ test: 'moo' }, ['test'])
      }).to.not.throw()
    })
    it('should validate nested keys', () => {
      expect(() => {
        util.enforceArgs({ test: { again: 'yup' } }, ['test.again'])
      }).to.not.throw()
    })
    it('to.throw nested keys', () => {
      expect(() => {
        util.enforceArgs({ test: { again: 'yup' } }, ['test.notthere'])
      }).to.throw(/is a required argument/)
    })
  })

  describe('Default Value', () => {
    it('should set a default value from a value', () => {
      let def = util.defaultValue(null, 1)
      expect(def).to.equal(1)
    })
    it('should set a default value from a function', () => {
      let func = sinon.stub().returns(1)
      let def = util.defaultValue(null, func)
      expect(func).to.have.been.calledOnce
      expect(def).to.equal(1)
    })
    it('default values from a function should not be evaluated unless needed', () => {
      let func = sinon.stub().returns(1)
      let def = util.defaultValue(1, func)
      expect(func).to.not.have.been.called
      expect(def).to.equal(1)
    })
  })

  describe('Null or Undefined', () => {
    it('should detect null', () => {
      expect(util.isEmpty(null)).to.equal(true)
    })
    it('should detect undefined', () => {
      expect(util.isEmpty(undefined)).to.equal(true)
    })
    it('should not false detect', () => {
      expect(util.isEmpty('')).to.equal(false)
    })
    it('to.throw if you pass it', () => {
      expect(() => {
        util.isEmpty(null, true)
      }).to.throw(/Null or undefined value/)
    })
    it('should enforce not empty on single argument', () => {
      expect(() => {
        util.enforceNotEmpty(null, true)
      }).to.throw(/Null or undefined value/)
    })
    it('should allow custom errors', () => {
      expect(() => {
        util.enforceNotEmpty(null, 'custom')
      }).to.throw(/custom/)
    })
    it('should enforce not empty on multiple arguments', () => {
      expect(() => {
        util.enforceNotEmpty(['not empty', null], true)
      }).to.throw(/Null or undefined value/)
    })
  })
})
