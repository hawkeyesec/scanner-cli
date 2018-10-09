'use strict'
/* eslint-disable no-unused-expressions */

let should = require('should')

let util = require('../util')

describe('Util', () => {
  describe('Args', () => {
    it('should enforce an arg', () => {
      (() => {
        util.enforceArgs({}, 'test')
      }).should.throw(/is a required argument/)
    })
    it('should enforce args', () => {
      (() => {
        util.enforceArgs({}, ['test', 'test2'])
      }).should.throw(/is a required argument/)
    })
    it('not throw if its ok', () => {
      (() => {
        util.enforceArgs({ test: 'moo' }, ['test'])
      }).should.not.throw()
    })
    it('should validate nested keys', () => {
      (() => {
        util.enforceArgs({ test: { again: 'yup' } }, ['test.again'])
      }).should.not.throw()
    })
    it('should throw nested keys', () => {
      (() => {
        util.enforceArgs({ test: { again: 'yup' } }, ['test.notthere'])
      }).should.throw(/is a required argument/)
    })
  })

  describe('Default Value', () => {
    it('should set a default value from a value', () => {
      let def = util.defaultValue(null, 1)
      should(def).eql(1)
    })
    it('should set a default value from a function', () => {
      let func = sinon.stub().returns(1)
      let def = util.defaultValue(null, func)
      expect(func).to.have.been.calledOnce
      should(def).eql(1)
    })
    it('default values from a function should not be evaluated unless needed', () => {
      let func = sinon.stub().returns(1)
      let def = util.defaultValue(1, func)
      expect(func).to.not.have.been.called
      should(def).eql(1)
    })
  })

  describe('Null or Undefined', () => {
    it('should detect null', () => {
      should(util.isEmpty(null)).eql(true)
    })
    it('should detect undefined', () => {
      should(util.isEmpty(undefined)).eql(true)
    })
    it('should not false detect', () => {
      should(util.isEmpty('')).eql(false)
    })
    it('should throw if you pass it', () => {
      (() => {
        util.isEmpty(null, true)
      }).should.throw(/Null or undefined value/)
    })
    it('should enforce not empty on single argument', () => {
      (() => {
        util.enforceNotEmpty(null, true)
      }).should.throw(/Null or undefined value/)
    })
    it('should allow custom errors', () => {
      (() => {
        util.enforceNotEmpty(null, 'custom')
      }).should.throw(/custom/)
    })
    it('should enforce not empty on multiple arguments', () => {
      (() => {
        util.enforceNotEmpty(['not empty', null], true)
      }).should.throw(/Null or undefined value/)
    })
  })
})
