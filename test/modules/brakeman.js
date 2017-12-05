'use strict';
const Brakeman = require('../../lib/modules/brakeman');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('Brakeman', () => {
  let sample = require('../samples/brakeman.json');
  let brakeman, mockExec, mockResults, fileManager;
  beforeEach(() => {
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    });
    mockExec.setup.commandExists.toReturn(true);

    const nullLogger = deride.stub(['log', 'debug', 'error']);
    fileManager = new FileManager({
      target: path.join(__dirname, '../samples/ruby'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    brakeman = new Brakeman({
      exec: mockExec
    });
    should(brakeman.handles(fileManager)).eql(true);
  });

  it('should execute brakeman . -f json', done => {
    brakeman.run(mockResults, () => {
      mockExec.expect.command.called.withArg('brakeman . -f json');
      done();
    });
  });

  it('should pass the whole advisory back as data', done => {
    brakeman.run(mockResults, () => {
      mockResults.expect.high.called.once();
      done();
    });
  });

  it('should parse the advisory properly', done => {
    brakeman.run(mockResults, () => {
      const item = {
        code: 'SQL',
        offender: 'app/controllers/application_controller.rb',
        description:'Possible SQL injection (http://brakemanscanner.org/docs/warning_types/sql_injection/)',
        mitigation: 'Check line 11'
      };

      mockResults.expect.high.called.withArgs(item);
      done();
    });
  });

  it('should not run brakemanScan if brakeman is not installed', done => {
    const mockExec = deride.stub(['commandExists']);
    const mockLogger = deride.stub(['warn']);
    mockExec.setup.commandExists.toReturn(false);

    const brakeman = new Brakeman({
      exec: mockExec,
      logger: mockLogger
    });

    should(brakeman.handles(fileManager)).eql(false);
    mockLogger.expect.warn.called.withArgs('Gemfile found but brakeman not found in $PATH');
    mockLogger.expect.warn.called.withArgs('brakemanScan will not run unless you install brakeman');
    mockLogger.expect.warn.called.withArgs('Please see: https://brakemanscanner.org/docs/install/');
    done();
  });

});
