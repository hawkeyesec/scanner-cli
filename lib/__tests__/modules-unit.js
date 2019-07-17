'use strict'

/* eslint-disable no-unused-expressions */

const Ajv = require('ajv')

const modules = require('../modules')

describe('Modules', () => {
  modules().forEach(module => {
    describe(module.key, () => {
      it('should have required properties', () => {
        let expectMethods = ['key', 'description', 'handles', 'run', 'enabled'].sort()
        expect(module).to.include.all.keys(expectMethods)
      })
    })
  })
})

describe('Configurable Modules', () => {
  modules()
    .filter(m => m.configSchema)
    .forEach(module => {
      describe(`${module.key} config schema`, () => {
        it('should be a valid JSON Schema', () => {
          const ajv = new Ajv({
            strictDefaults: true,
            strictKeywords: true
          })

          expect(ajv.validateSchema(module.configSchema)).to.be.true
        })

        it('should expect an object', () => {
          expect(module.configSchema.type).to.be.equal('object')
        })

        it('should have at least one example', () => {
          expect(module.configSchema.examples).to.have.lengthOf.at.least(1)
        })

        it('should have valid examples', () => {
          const ajv = new Ajv({
            strictDefaults: true,
            strictKeywords: true,
            removeAdditional: true
          })

          if (!module.configSchema.hasOwnProperty('additionalProperties')) {
            module.configSchema.additionalProperties = false
          }

          module.configSchema.examples.forEach((e, i) => {
            const validate = ajv.compile(module.configSchema)
            expect(validate(e), `Example #${i}`).to.be.true
          })
        })

        it('should have some title for root level properties', () => {
          for (const [property, definition] of Object.entries(module.configSchema.properties)) {
            expect(definition.title, property).to.not.be.empty
          }
        })

        it('should have some type defined for root level properties', () => {
          for (const [property, definition] of Object.entries(module.configSchema.properties)) {
            expect(definition.type, property).to.not.be.empty

            if (definition.type === 'array') {
              expect(definition.items.type, `${property} items`).to.not.be.empty
            }
          }
        })

        it('should accept empty object as valid config', () => {
          const ajv = new Ajv({
            strictDefaults: true,
            strictKeywords: true,
            removeAdditional: true,
            useDefaults: true
          })

          if (!module.configSchema.hasOwnProperty('additionalProperties')) {
            module.configSchema.additionalProperties = false
          }

          const validate = ajv.compile(module.configSchema)
          expect(validate({})).to.be.true
        })
      })
    })
})
