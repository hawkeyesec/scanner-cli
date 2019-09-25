'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const exec = require('../../../exec')
const FileManager = require('../../../file-manager')
const { run, handles } = require('..')

describe('Java outdated dependencies module', () => {
  const mvnOutput = path.join(__dirname, 'sample', 'mvnOutput.txt')

  beforeEach(() => {
    sinon.stub(exec, 'command').resolves({ stdout: '' })
  })

  it('should run on maven java projects', async () => {
    sinon.stub(exec, 'exists').resolves(true)

    const target = path.join(__dirname, 'sample', 'java-maven')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.true
  })

  it('should not run if mvn is executable is not available', async () => {
    sinon.stub(exec, 'exists').resolves(false)

    const target = path.join(__dirname, 'sample', 'java-maven')
    const fm = new FileManager({ target })

    expect(await handles(fm)).to.be.false
  })

  it('should execute maven versions plugin', async () => {
    const target = path.join(__dirname, 'sample', 'java-maven')
    const fm = new FileManager({ target })

    await run(fm, mvnOutput)

    expect(exec.command.firstCall.args[0]).to.equal(`mvn --batch-mode versions:display-dependency-updates -Dversions.outputFile=${mvnOutput}`)
    expect(exec.command.firstCall.args[1]).to.deep.equal({ cwd: target, stdio: ['ignore', 'ignore', 'pipe'] })
  })

  it('should parse maven report', async () => {
    const target = path.join(__dirname, 'sample', 'java-maven')
    const fm = new FileManager({ target })

    const { results } = await run(fm, mvnOutput)

    expect(results.low).to.deep.contain({
      code: 'java-outdated-dependencies-antlr:antlr',
      offender: 'antlr:antlr:2.7.7',
      description: '',
      mitigation: 'Update to antlr:antlr 20030911'
    })

    expect(results.low).to.deep.contain({
      code: 'java-outdated-dependencies-com.microsoft.sqlserver:mssql-jdbc',
      offender: 'com.microsoft.sqlserver:mssql-jdbc:6.4.0.jre8',
      description: '',
      mitigation: 'Update to com.microsoft.sqlserver:mssql-jdbc 7.3.1.jre12-preview'
    })
  })
})
