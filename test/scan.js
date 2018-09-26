'use strict'
const Scan = require('../lib/scan')
const deride = require('deride')
const should = require('should')
const Rc = require('../lib/rc')
const path = require('path')
const npmAuditReport = require('./samples/nodejs/auditreport.json')
const npmOutdatedReport = require('./samples/nodejs/outdatedreport.json')

describe('Scan', () => {
  let scan, mockExec, rc;
  before(() => {
    mockExec = deride.stub(['command', 'commandExists'])
    mockExec.setup.commandExists.toReturn(true)
    mockExec.setup.command.toDoThis((command, options, done) => {
      let stdout
      switch (command) {
        case 'npm outdated --json':
          stdout = JSON.stringify(npmOutdatedReport)
          break

        case 'npm audit --json':
          stdout = JSON.stringify(npmAuditReport)
          break

        default:
          stdout = ''
          break
      }

    const nullLogger = deride.stub(['log', 'debug', 'error']);
    rc = new Rc();
    rc.logger = nullLogger;
    rc.exec = mockExec;
    rc.withTarget(path.join(__dirname, 'samples/nodejs'));
    scan = new Scan(rc);
  });
});
  it('should run a scan and return results for each of the enabled modules', done => {
    scan.start((err, results) => {
      should(err).eql(null);
      should(results.length).eql(6);
      done();
    });
  });

  it('should run a scan and return results for each of the enabled modules exlcuding the ignore error codes', done => {
    rc.errorExclude["files-5:cert.pem"] = true;
    let finalResults = 0;
    scan.start((err, results) => {
      should(err).eql(null);
      results.forEach(moduleResult => {
        Object.keys(moduleResult.results).forEach(key => {
          moduleResult.results[key].forEach(() => {
            finalResults++;
          });
        });
    });
      should(finalResults).eql(20);
      done();
    });
  });

});