'use strict';
const FindSecBugs = require('../../lib/modules/findSecBugs');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');
const fs = require('fs');


describe('FindSecBugs', () => {
  let findSecBugs, mockExec, mockResults, fileManager, sampleReportPath, nullLogger;
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists', 'commandSync']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: null
    });
    mockExec.setup.commandSync.toReturn({ stdout: '/usr/bin/findsecbugs' });
    mockExec.setup.commandExists.toReturn(true);

    nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java/maven'),
      logger: nullLogger
    });

    sampleReportPath = path.join(__dirname, '../samples/findSecBugsReport.xml');
    fileManager = deride.wrap(fileManager);

    const sampleReport = fs.readFileSync(sampleReportPath, 'utf-8');
    fileManager.setup.readFileSync.toReturn(sampleReport);
    fileManager.setup.exists.toReturn(true);

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    findSecBugs = new FindSecBugs({
      exec: mockExec
     });

    should(findSecBugs.handles(fileManager)).eql(true);
  });

  it('should execute findsecbugs with all required arguments', done => {
    findSecBugs.run(mockResults, () => {
      mockExec.expect.command.called.withArg(`findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml ${fileManager.target}`);
      done();
    });
  });

  it('should log issues with priority 1 as high', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'XML_DECODER',
        offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
        description: 'It is not safe to use an XMLDecoder to parse user supplied data',
        mitigation: 'Check line(s) [47-48]'
      };

      mockResults.expect.high.called.withArgs(item);
      done();
    });
  });

  it('should log issues with priority 2 as medium', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'PREDICTABLE_RANDOM',
        offender: 'In method com.hawkeye.java.test.config.MyVulnerableConfigClass.generateSecretToken()',
        description: 'The use of java.util.Random is predictable',
        mitigation: 'Check line(s) 30'
      };

      mockResults.expect.medium.called.withArgs(item);
      done();
    });
  });

  it('should log issues with Priority 3 as low', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'COOKIE_USAGE',
        offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
        description: 'Sensitive data may be stored by the application in a cookie',
        mitigation: 'Check line(s) 44'
      };

      mockResults.expect.low.called.withArgs(item);
      done();
    });
  });

  it('should line number of all sourceLines', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'CRLF_INJECTION_LOGS',
        offender: 'In method com.hawkeye.java.Application.main(String[])',
        description: 'This use of Logger.info(...) might be used to include CRLF characters into log messages',
        mitigation: 'Check line(s) 50, 55, 57, 59, 60, 61'
      };

      mockResults.expect.low.called.withArgs(item);
      done();
     });
  });

  it('should not run findSecBugs if not installed', done => {
    const mockExec = deride.stub(['commandExists']);
    const mockLogger = deride.stub(['warn']);
    mockExec.setup.commandExists.toReturn(false);

    const findSecBugs = new FindSecBugs({
      exec: mockExec,
      logger: mockLogger
    });

    should(findSecBugs.handles(fileManager)).eql(false);
    mockLogger.expect.warn.called.withArgs('pom.xml found but findSecBugs was not found in $PATH');
    mockLogger.expect.warn.called.withArgs('findSecBugs scan will not run unless you install findSecBugs CLI');
    mockLogger.expect.warn.called.withArgs('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/findsecbugs/README.md');
    done();
  });

  it('should log error message when reported was not created', done => {
    let mockExec = deride.stub(['command', 'commandExists', 'commandSync']);
    mockExec.setup.command.toCallbackWith(null, {
      stderr: 'Error!'
    });
    mockExec.setup.commandExists.toReturn(true);
    mockExec.setup.commandSync.toReturn({ stdout: '/usr/bin/findsecbugs' });

    const mockLogger = deride.stub(['error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java/maven'),
      logger: nullLogger
    });
    fileManager = deride.wrap(fileManager);
    fileManager.setup.exists.when(sampleReportPath).toReturn(false);

    const findSecBugs = new FindSecBugs({
      exec: mockExec,
      logger: mockLogger
    });

    findSecBugs.handles(fileManager);
    findSecBugs.run(mockResults, ()=>{});

    mockLogger.expect.error.called.withArgs('There was an error while executing FindSecBugs and the report was not created: "Error!"');

    done();
  });

  it('should not try to log issues when there are no issues', done => {
    sampleReportPath = path.join(__dirname, '../samples/findSecBugsReportWithoutIssues.xml');
    const sampleReport = fs.readFileSync(sampleReportPath, 'utf-8');

    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java/maven'),
      logger: nullLogger
    });

    fileManager = deride.wrap(fileManager);
    fileManager.setup.exists.toReturn(true);
    fileManager.setup.readFileSync.toReturn(sampleReport);

    findSecBugs.handles(fileManager);

    findSecBugs.run(mockResults, ()=>{
      mockResults.expect.low.called.never();
      mockResults.expect.medium.called.never();
      mockResults.expect.high.called.never();
    });

    done();
  });

  it('should handle gradle projects', done => {
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java/gradle/'),
      logger: nullLogger
    });

    should(findSecBugs.handles(fileManager)).eql(true);
    done();
  });

});
