'use strict';
const Ncu = require('../../lib/modules/ncu');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('NCU', () => {
  const sample = require('../samples/ncu.json');
  let ncu, mockExec, mockResults;
  beforeEach(() => {
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    });
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs'),
      logger: nullLogger
    });
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    ncu = new Ncu({
      exec: mockExec
    });
    should(ncu.handles(fileManager)).eql(true);
  });

  it('should execute ncu -j', done => {
    ncu.run(mockResults, () => {
      const pathToJson = path.join(__dirname, '../../node_modules/npm-check-updates/bin/ncu -j');
      mockExec.expect.command.called.withArg(pathToJson);
      done();
    });
  });

  it('should log major version changes as high', done => {
    mockResults.setup.high.toDoThis(data => {
      should(data.offender).eql('nodemailer');
      should(data.code).eql(1);
    });
    ncu.run(mockResults, done);
  });

  it('should log minor version changes as medium', done => {
    mockResults.setup.medium.toDoThis(data => {
      should(['body-parser', 'debug', 'express', 'morgan', 'serve-favicon'].indexOf(data.offender)).not.eql(-1);
      should(data.code).eql(2);
    });
    ncu.run(mockResults, done);
  });

  it('should log patch version changes as low', done => {
    mockResults.setup.low.toDoThis(data => {
      should(data.offender).eql('async');
      should(data.code).eql(3);
    });
    ncu.run(mockResults, done);
  });

});
