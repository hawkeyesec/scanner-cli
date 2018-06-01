'use strict';
const Nsp = require('../../lib/modules/node-nsp');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('Nsp', () => {
  let sample = require('../samples/nsp.json');
  let nsp, mockExec, mockResults;
  beforeEach(() => {
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toCallbackWith(null, {
      stderr: JSON.stringify(sample)
    });
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    nsp = new Nsp({
      exec: mockExec
    });
    should(nsp.handles(fileManager)).eql(true);
  });

  it('should execute nsp check --reporter json', done => {
    nsp.run(mockResults, () => {
      let pathToJson = path.join(__dirname, '../../node_modules/nsp/bin/nsp check --reporter json');
      mockExec.expect.command.called.withArg(pathToJson);
      done();
    });
  });

  it('should pass the whole advisory back as data', done => {
    mockResults.setup.critical.toDoThis(data => {
      should(Object.keys(data.data).indexOf('cvss_score')).not.eql(-1);
    });
    nsp.run(mockResults, done);
  });

  it('should log cvss scores over 8 as critical', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.critical.called.once();
      done();
    });
  });

  it('should log cvss scores between 6 and 8 as high', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.high.called.once();
      done();
    });
  });

  it('should log cvss scores between 4 and 6 as medium', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.medium.called.once();
      done();
    });
  });

  it('should log cvss scores under 4 as low', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.low.called.once();
      done();
    });
  });

});
