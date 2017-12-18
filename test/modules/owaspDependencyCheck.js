'use strict';
const OwaspCheck = require('../../lib/modules/owaspDependencyCheck');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');
const fs = require('fs');

describe('OWASP Dependency Check', ()=> {
  let sample = require('../samples/owaspDependencySample.json');

  let owaspCheck, mockExec, mockResults, fileManager;
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    });
    mockExec.setup.commandExists.toReturn(true);
    
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    owaspCheck = new OwaspCheck({
      exec: mockExec
    });

  });

  const buildFileManager = (folder, reportFile='../samples/owaspDependencySample.json') => {
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, folder),
      logger: nullLogger
    });

    const sampleReportPath = path.join(__dirname, reportFile);
    fileManager = deride.wrap(fileManager);

    const sampleReport = fs.readFileSync(sampleReportPath, 'utf-8');
    fileManager.setup.readFileSync.toReturn(sampleReport);
    fileManager.setup.exists.when('dependency-check-report.json').toReturn(true);

    return fileManager;
  };

  it('should execute dependency-check for maven', done => {
    const fileManager = buildFileManager('../samples/java/maven');
    should(owaspCheck.handles(fileManager)).eql(true);
    owaspCheck.run(mockResults, () => {
      mockExec.expect.command.called.withArg(`dependency-check --project Testing --format JSON --out . -s ${fileManager.target}/target/main.jar`);
      done();
    });
  });

  it('should execute dependency-check for gradle', done => {
    const fileManager = buildFileManager('../samples/java/gradle');

    should(owaspCheck.handles(fileManager)).eql(true);
    owaspCheck.run(mockResults, () => {
      mockExec.expect.command.called.withArg(`dependency-check --project Testing --format JSON --out . -s ${fileManager.target}/build/main.jar`);
      done();
    });
  });

  it('should not handle when there is no jar file on the specified folder', done => {
    const mockLogger = deride.stub(['warn']);

    const owaspCheck = new OwaspCheck({
      logger: mockLogger
    });

    const fileManager = buildFileManager('../samples/java/maven-with-no-jar');
    should(owaspCheck.handles(fileManager)).eql(false);
    done();
  });

  it('should not handle when there is no java file on the specified folder', done => {
    const mockLogger = deride.stub(['warn']);

    const owaspCheck = new OwaspCheck({
      logger: mockLogger
    });

    const fileManager = buildFileManager('../samples/java/empty-folder');
    should(owaspCheck.handles(fileManager)).eql(false);
    done();
  });

  it('should not run dependency-check if not installed', done => {
    const mockExec = deride.stub(['commandExists']);
    const mockLogger = deride.stub(['warn']);
    mockExec.setup.commandExists.toReturn(false);

    const owaspCheck = new OwaspCheck({
      exec: mockExec,
      logger: mockLogger
    });

    const fileManager = buildFileManager('../samples/java/maven');

    should(owaspCheck.handles(fileManager)).eql(false);
    mockLogger.expect.warn.called.withArgs('java files found but dependency-check was not found in $PATH');
    mockLogger.expect.warn.called.withArgs('dependency-check scan will not run unless you install Owasp Dependency Check CLI');
    mockLogger.expect.warn.called.withArgs('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/owaspDependencyCheck/README.md');
    done();
  });

  it('should log issues from the report json', done => {
    const fileManager = buildFileManager('../samples/java/maven');
    should(owaspCheck.handles(fileManager)).eql(true);
    
    owaspCheck.run(mockResults, () => {
      const item = {
	code: 'CVE-2013-4499',
        offender: 'tw-bnb-backend-0.0.1-SNAPSHOT.jar: mapstruct-1.1.0.Final.jar',
        description: 'Cross-site scripting (XSS) vulnerability in the Bean module 7.x-1.x before 7.x-1.5 for Drupal allows remote attackers to inject arbitrary web script or HTML via the bean title.',
        mitigation: 'https://drupal.org/node/2118867, https://drupal.org/node/2118873, https://exchange.xforce.ibmcloud.com/vulnerabilities/88278'
      };

      mockResults.expect.medium.called.withArgs(item);
      done();
    });
  });

   it('should not log issues if the report doesnt have vulnerabilities', done => {
     const fileManager = buildFileManager('../samples/java/maven', '../samples/owaspDependencySampleNoIssue.json');
    should(owaspCheck.handles(fileManager)).eql(true);
    
    owaspCheck.run(mockResults, () => {

      mockResults.expect.critical.called.never();
      mockResults.expect.high.called.never();
      mockResults.expect.medium.called.never();
      mockResults.expect.low.called.never();
      done();
    });
  });

  it('should log error message when the report was not created', done => {
    let mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stderr: 'Error!'
    });
    mockExec.setup.commandExists.toReturn(true);

    const mockLogger = deride.stub(['error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java/maven'),
      logger: deride.stub(['log', 'debug', 'error'])
    });
    fileManager = deride.wrap(fileManager);

    fileManager.setup.exists.when('dependency-check-report.json').toReturn(false);

    const owaspCheck = new OwaspCheck({
      exec: mockExec,
      logger: mockLogger
    });

    owaspCheck.handles(fileManager);
    owaspCheck.run(mockResults, ()=>{});

    mockLogger.expect.error.called.withArgs('There was an error while executing Owasp Dependency Check and the report was not created: "Error!"');

    done();
  });

});
