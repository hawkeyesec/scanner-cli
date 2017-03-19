'use strict';
const Scan = require('../lib/scan');
const path = require('path');
const deride = require('deride');
const should = require('should');

describe('Scan', () => {
  let scan, mockExec;
  before(() => {
    let ncuSample = require('./samples/ncu.json');
    let nspSample = require('./samples/nsp.json');
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toDoThis((command, options, done) => {
      if(command.indexOf('nsp') > -1) {
        return done(null, {
          stderr: JSON.stringify(nspSample)
        });
      }
      return done(null, {
        stdout: JSON.stringify(ncuSample)
      });
    });

    let mockLogger = deride.stub(['log', 'debug', 'error']);
    scan = new Scan({
      target: path.join(__dirname, 'samples/nodejs'),
      exec: mockExec,
      logger: mockLogger
    });
  });

  it('should run a scan', done => {
    scan.start(['all'], (err, results) => {
      should(err).eql(null);
      should(results.length).eql(4);
      done();
    });
  });
});
