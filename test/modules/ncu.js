'use strict';
const Ncu = require('../../lib/modules/ncu');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('NCU', () => {
  let sample = require('../samples/ncu.json');
  let ncu, mockExec, mockResults;
  beforeEach(() => {
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    });
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/nodejs')
    });
    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    ncu = new Ncu({
      exec: mockExec
    });
    should(ncu.handles(fileManager)).eql(true);
  });

  it('should execute ncu -j', done => {
    ncu.run(mockResults, () => {
      let pathToJson = path.join(__dirname, '../../node_modules/npm-check-updates/bin/ncu -j');
      mockExec.expect.command.called.withArg(pathToJson);
      done();
    });
  });

  it('should log major version changes as high', done => {
    ncu.run(mockResults, () => {
      mockResults.expect.high.called.withArg('nodemailer');
      done();
    });
  });

  it('should log minor version changes as medium', done => {
    ncu.run(mockResults, () => {
      mockResults.expect.medium.called.withArg('body-parser');
      mockResults.expect.medium.called.withArg('debug');
      mockResults.expect.medium.called.withArg('express');
      mockResults.expect.medium.called.withArg('morgan');
      mockResults.expect.medium.called.withArg('serve-favicon');
      done();
    });
  });

  it('should log patch version changes as low', done => {
    ncu.run(mockResults, () => {
      mockResults.expect.low.called.withArg('async');
      done();
    });
  });

});
