'use strict'

const modules = require('../modules')

describe('Modules', () => {
  modules().forEach(module => {
    describe(module.name, () => {
      it('should have the module signature', () => {
        let expectMethods = ['key', 'name', 'description', 'handles', 'run', 'enabled'].sort()
        expect(Object.keys(module).sort()).to.deep.equal(expectMethods)
      })
    })
  })
})
