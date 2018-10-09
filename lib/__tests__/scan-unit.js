'use strict'
const Scan = require('../scan')
const Rc = require('../rc')
const path = require('path')

describe('Scan', () => {
  let scan, mockExec
  beforeEach(() => {
    mockExec = {
      command: sinon.stub(),
      commandExists: sinon.stub()
    }

    mockExec.commandExists.returns(true)
    mockExec.command.yields(null, { stdout: '' })

    const rc = new Rc()
    rc.exec = mockExec
    rc.withTarget(path.join(__dirname, 'samples/nodejs'))
    scan = new Scan(rc)
  })

  it('should run a scan and return results for each of the enabled modules', function (done) {
    scan.start((err, results) => {
      expect(err).to.equal(null)
      expect(results.length).to.equal(6)
      done()
    })
  })
})
