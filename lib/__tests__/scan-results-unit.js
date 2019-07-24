const { ScanResults } = require('../scan-results.js')
const ModuleResults = require('../results.js')

describe('ScanResults', () => {
  describe('allWithLevelAtLeast', () => {
    it('should NOT return the result that has "low" level, but "critical" level is requested', () => {
      const scanResults = new ScanResults([{ level: 'low' }])
      expect(scanResults.allWithLevelAtLeast('critical')).to.have.lengthOf(0)
    })

    it('should return the result that has "high" level and "medium" level is requested', () => {
      const scanResults = new ScanResults([{ level: 'high' }])
      expect(scanResults.allWithLevelAtLeast('medium')).to.have.lengthOf(1)
    })

    it('should return results with level above or equal the requested one', () => {
      const levels = {
        low: ['low'],
        medium: ['low', 'medium'],
        high: ['low', 'medium', 'high'],
        critical: ['low', 'medium', 'high', 'critical']
      }

      for (const resultLevel in levels) {
        const scanResults = new ScanResults([{ level: resultLevel }])
        for (const lowerLevel of levels[resultLevel]) {
          expect(scanResults.allWithLevelAtLeast(lowerLevel)).to.have.lengthOf(1)
        }
      }
    })

    it('should filter out results with level below the requested one', () => {
      const levels = {
        low: ['medium', 'high', 'critical'],
        medium: ['high', 'critical'],
        high: ['critical'],
        critical: []
      }
      for (const lowerLevel in levels) {
        const scanResults = new ScanResults([{ level: lowerLevel }])
        for (const upperLevel of levels[lowerLevel]) {
          expect(scanResults.allWithLevelAtLeast(upperLevel)).to.have.lengthOf(0)
        }
      }
    })
  })

  describe('fromModuleResultsList', () => {
    it('should assign correct module name to results', () => {
      const moduleResults = new ModuleResults('test-mod')
      moduleResults.critical({})

      const scanResults = ScanResults.fromModuleResultsList([moduleResults])
      const displayResult = scanResults.allWithLevelAtLeast('low')[0]

      expect(displayResult.module).to.be.equal('test-mod')
    })

    it('should assign correct level to results', () => {
      const moduleResults = new ModuleResults('test-mod')
      moduleResults.critical({})

      const scanResults = ScanResults.fromModuleResultsList([moduleResults])
      const displayResult = scanResults.allWithLevelAtLeast('critical')[0]

      expect(displayResult.level).to.be.equal('critical')
    })

    it('should join results of two modules in a single array', () => {
      const moduleResults1 = new ModuleResults('test-mod1')
      moduleResults1.critical({})
      const moduleResults2 = new ModuleResults('test-mod2')
      moduleResults2.high({})

      const scanResults = ScanResults.fromModuleResultsList([moduleResults1, moduleResults2])
      const displayResult1 = scanResults.allWithLevelAtLeast('low')[0]
      const displayResult2 = scanResults.allWithLevelAtLeast('low')[1]

      expect(displayResult1.module).to.be.equal('test-mod1')
      expect(displayResult2.module).to.be.equal('test-mod2')
    })

    it('should copy `offender`, `description` and `mitigation` fields from module results', () => {
      const offender = 'some offender'
      const description = 'Some desc'
      const mitigation = 'some action'
      const moduleResults = new ModuleResults('test-mod')
      moduleResults.critical({ offender, description, mitigation })

      const scanResults = ScanResults.fromModuleResultsList([moduleResults])
      const displayResult = scanResults.allWithLevelAtLeast('critical')[0]

      expect(displayResult.offender).to.be.equal(offender)
      expect(displayResult.description).to.be.equal(description)
      expect(displayResult.mitigation).to.be.equal(mitigation)
    })

    it('should prefix result `code` with module name', () => {
      const moduleResults = new ModuleResults('test-mod')
      moduleResults.critical({ code: 'some-code' })

      const scanResults = ScanResults.fromModuleResultsList([moduleResults])
      const displayResult = scanResults.allWithLevelAtLeast('critical')[0]

      expect(displayResult.code).to.be.equal('test-mod-some-code')
    })
  })
})
