'use strict'

const path = require('path')
const { handles, run } = require('..')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const auditReport = require('./sample/auditreport.json')
const fs = require('fs')

/* eslint-disable no-unused-expressions */

describe('cargo audit Module', () => {
  const targetWithLockFile = path.join(__dirname, 'sample', 'default')
  const targetNoLock = path.join(__dirname, 'sample', 'no-lock-file')
  let fmWithLockFile
  let fmNoLock

  function givenCargoInstalled () {
    sinon.stub(exec, 'exists').withArgs('cargo').resolves(true)
  }

  function givenCargoAuditReturnsReport (auditReport) {
    exec.command.withArgs('cargo audit --json').resolves({ stdout: JSON.stringify(auditReport) })
  }

  function givenCargoCanGenerateLockFile () {
    exec.command.withArgs('cargo generate-lockfile').resolves({ stdout: '' })
  }

  function givenModuleCanRemoveLockFile () {
    fs.unlinkSync.withArgs('Cargo.lock').returns(undefined)
  }

  beforeEach(() => {
    sinon.stub(exec, 'command')
    sinon.stub(fs, 'unlinkSync')
    givenCargoInstalled()
    fmWithLockFile = new FileManager({ target: targetWithLockFile })
    fmNoLock = new FileManager({ target: targetNoLock })
  })

  it('should handle Rust projects with Cargo.lock file', async () => {
    expect(await handles(fmWithLockFile)).to.be.true
  })

  it('should handle Rust projects with NO Cargo.lock file', async () => {
    expect(await handles(fmNoLock)).to.be.true
  })

  it('should execute cargo generate-lockfile if no lock file present', async () => {
    givenCargoAuditReturnsReport(auditReport)
    givenCargoCanGenerateLockFile()
    givenModuleCanRemoveLockFile()

    await run(fmNoLock)

    expect(exec.command.withArgs('cargo generate-lockfile')).to.have.been.calledOnce
  })

  it('should remove lock file after execution if no lock file present', async () => {
    givenCargoAuditReturnsReport(auditReport)
    givenCargoCanGenerateLockFile()
    givenModuleCanRemoveLockFile()

    await run(fmNoLock)

    expect(fs.unlinkSync.withArgs(path.join(fmNoLock.target, 'Cargo.lock'))).to.have.been.calledAfter(exec.command.withArgs('cargo audit --json'))
  })

  it('should NOT remove lock file after execution if lock file IS present', async () => {
    givenCargoAuditReturnsReport(auditReport)
    givenModuleCanRemoveLockFile()

    await run(fmWithLockFile)

    expect(fs.unlinkSync.withArgs('Cargo.lock')).to.have.not.been.called
  })

  it('should report critical severity vulnerabilities', async () => {
    givenCargoAuditReturnsReport(auditReport)

    const { results } = await run(fmWithLockFile)

    expect(results.critical).to.have.length(1)
    expect(results.critical[0]).to.deep.equal({
      code: 'rust-cargoaudit-RUSTSEC-2018-0002',
      description: 'Links in archives can overwrite any existing file (https://github.com/alexcrichton/tar-rs/pull/156)',
      mitigation: 'Update "tar" crate to one of the following versions: >= 0.4.16',
      offender: 'tar=0.4.5'
    })
  })
})
