'use strict'

require('should')
const deride = require('deride')
const Modules = require('../modules')

describe('Modules', () => {
  new Modules({
    logger: deride.stub(['log'])
  }).asArray.forEach(module => {
    describe(module.name, () => {
      it('should have the module signature', () => {
        let expectMethods = ['key', 'name', 'description', 'handles', 'run', 'enabled'].sort()
        Object.keys(module).sort().should.eql(expectMethods)
      })
    })
  })
})
