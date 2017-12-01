'use strict';
const FindSecBugs = require('../../lib/modules/findSecBugs');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');
const fs = require('fs');


describe('FindSecBugs', () => {
  let findSecBugs, mockExec, mockResults, fileManager;
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: null
    });
    mockExec.setup.commandExists.toReturn(true);

    const nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/java'),
      logger: nullLogger
    });

    fileManager = deride.wrap(fileManager);
    const sampleReport = fs.readFileSync(path.join(__dirname, '../samples/findSecBugsReport.xml'), 'utf-8');
    fileManager.setup.readFileSync.toReturn(sampleReport);

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    findSecBugs = new FindSecBugs({
      exec: mockExec
    });

    should(findSecBugs.handles(fileManager)).eql(true);
  });

  it('should execute findsecbugs with all required arguments', done => {
    findSecBugs.run(mockResults, () => {
      mockExec.expect.command.called.withArg(`findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml -low /target`);
      done();
    });
  });

  it('should log issues with HIGH severity as high', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'XML_DECODER',
        offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
        description: 'It is not safe to use an XMLDecoder to parse user supplied data',
        mitigation: 'Check lines [47-48]'
      };

      mockResults.expect.high.called.withArgs(item);
      done();
    });
  });

  it('should log issues with MEDIUM severity as medium', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'PREDICTABLE_RANDOM',
        offender: 'In method com.hawkeye.java.test.config.MyVulnerableConfigClass.generateSecretToken()',
        description: 'The use of java.util.Random is predictable',
        mitigation: 'Check line 30'
      };

      mockResults.expect.medium.called.withArgs(item);
      done();
    });
  });

  it('should log issues with LOW severity as low', done => {
    findSecBugs.run(mockResults, () => {
      const item = {
        code: 'COOKIE_USAGE',
        offender: 'In method com.hawkeye.java.test.controller.MyVulnerableControllerClass.Update(int, UpdateCommand, BindingResult)',
        description: 'Sensitive data may be stored by the application in a cookie',
        mitigation: 'Check line 44'
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

});
