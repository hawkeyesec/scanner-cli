'use strict'

/* eslint-disable no-unused-expressions */

const { resolve } = require('path')
const { command, commandSync, exists } = require('../exec')

describe('exec', () => {
  describe('command', () => {
    it('should execute commands', async () => {
      const { code, stdout, stderr } = await command('pwd')
      expect(code).to.equal(0)
      expect(stdout).to.equal(process.cwd())
      expect(stderr).to.be.empty
    })

    it('should execute commands on other directories', async () => {
      const cwd = resolve(process.cwd(), 'lib')
      const { code, stdout, stderr } = await command('pwd', { cwd })
      expect(code).to.equal(0)
      expect(stdout).to.equal(cwd)
      expect(stderr).to.be.empty
    })
    it('should throw on error', async () => {
      let thrown = false
      try {
        await command('unknown-command')
      } catch (e) {
        thrown = true
        expect(e).to.be.instanceof(Error)
        expect(e.code).to.equal(255)
        expect(e.stdout).to.exist
        expect(e.stderr).to.exist
      }
      expect(thrown).to.be.true
    })
  })

  describe('commandSync', () => {
    it('should execute commands', () => {
      const { code, stdout, stderr } = commandSync('pwd')
      expect(code).to.equal(0)
      expect(stdout).to.equal(process.cwd())
      expect(stderr).to.be.empty
    })

    it('should execute commands on other directories', () => {
      const cwd = resolve(process.cwd(), 'lib')
      const { code, stdout, stderr } = commandSync('pwd', { cwd })
      expect(code).to.equal(0)
      expect(stdout).to.equal(cwd)
      expect(stderr).to.be.empty
    })
    it('should throw on error', () => {
      let thrown = false
      try {
        commandSync('unknown-command')
      } catch (e) {
        thrown = true
        expect(e).to.be.instanceof(Error)
        expect(e.code).to.equal(255)
        expect(e.stdout).to.exist
        expect(e.stderr).to.exist
      }
      expect(thrown).to.be.true
    })
  })

  describe('exists', () => {
    it('should find a command', async () => {
      expect(await exists('which')).to.equal(true)
    })
    it('should not find a command', async () => {
      expect(await exists('unknown-command-foo')).to.equal(false)
    })
  })
})
