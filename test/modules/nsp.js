'use strict';
const Nsp = require('../../lib/modules/nsp');
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

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    nsp = new Nsp({
      target: path.join(__dirname, '../samples/nodejs'),
      exec: mockExec
    });
  });

  it('should handle requests where the json file is present', () => {
    should(nsp.handles() === true);
  });

  it('should execute nsp check -o json', done => {
    nsp.run(mockResults, () => {
      let pathToJson = path.join(__dirname, '../../node_modules/nsp/bin/nsp check -o json');
      mockExec.expect.command.called.withArg(pathToJson);
      done();
    });
  });

  it('should log cvss scores over 8 as critical', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.critical.called.withArg('uglify-js');
      done();
    });
  });

  it('should log cvss scores between 6 and 8 as high', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.high.called.withArg('negotiator');
      done();
    });
  });

  it('should log cvss scores between 4 and 6 as medium', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.medium.called.withArg('uglify-js');
      done();
    });
  });


  it('should log cvss scores under 4 as low', done => {
    nsp.run(mockResults, () => {
      mockResults.expect.low.called.withArg('async');
      done();
    });
  });

});
