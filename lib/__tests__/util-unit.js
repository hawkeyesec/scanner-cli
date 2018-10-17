'use strict'
/* eslint-disable no-unused-expressions */

let util = require('../util')

describe('Util', () => {
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
  })
})
