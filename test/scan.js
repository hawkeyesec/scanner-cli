'use strict';
const Scan = require('../lib/scan');
const deride = require('deride');
const should = require('should');
const Rc = require('../lib/rc');
const path = require('path');

describe('Scan', () => {
  let scan, mockExec, rc;
  before(() => {
    let ncuSample = require('./samples/ncu.json');
    let nspSample = require('./samples/nsp.json');
    mockExec = deride.stub(['command', 'commandExists']);
    mockExec.setup.commandExists.toReturn(true);
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

    const nullLogger = deride.stub(['log', 'debug', 'error']);
    rc = new Rc();
    rc.logger = nullLogger;
    rc.exec = mockExec;
    rc.withTarget(path.join(__dirname, 'samples/nodejs'));
    scan = new Scan(rc);
  });

  it('should run a scan and return results for each of the enabled modules', done => {
    scan.start((err, results) => {
      should(err).eql(null);
      should(results.length).eql(6);
      done();
    });
  });

  it('should run a scan and return results for each of the enabled modules exlcuding the ignore error codes', done => {
    rc.errorExclude["Potential cryptographic private key"] = true;
    let finalResults = 0;
    scan.start((err, results) => {
      should(err).eql(null);
      results.forEach(moduleResult => {
        Object.keys(moduleResult.results).forEach(key => {
          moduleResult.results[key].forEach((result, index) => {
            finalResults++;
          });
        });
    });
      should(finalResults).eql(20);
      done();
    });
  })


});
