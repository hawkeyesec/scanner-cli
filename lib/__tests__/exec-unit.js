'use strict'

/* eslint-disable no-unused-expressions */

let Exec = require('../exec')
let should = require('should')

describe('Exec', () => {
  let exec, proc
  before(() => {
    proc = {
      exit: sinon.stub(),
      stderr: { write: sinon.stub() },
      stdout: { write: sinon.stub() }
    }
    exec = new Exec({
      process: proc
    })
  })

  describe('command', () => {
    it('should execute commands, and return the result', done => {
      exec.command('pwd', {}, (_, result) => {
        should(result.stdout).eql(process.cwd())
        done()
      })
    })
    it('should execute commands, and write them to stdout', done => {
      exec.command('pwd', { output: true }, () => {
        expect(proc.stdout.write).to.have.been.called
        expect(proc.stdout.write).to.have.been.calledWith(process.cwd() + '\n')
        done()
      })
    })
    it('should exit the process on error', done => {
      exec.command('some-command-that-doesnt-exist', { exit: true }, () => {
        expect(proc.exit).to.have.been.called
        expect(proc.exit).to.have.been.calledWith(1)
        done()
      })
    })
  })
})
