'use strict';
const util = require('../../util');
const xml2js = require('xml2js');


module.exports = function FindSecBugs(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'findSecBugs';
  self.name = 'FindSecBugs Scan';
  self.description = 'FindSecBugs find common security issues in Java code.';
  self.enabled = true;
  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const pomFileExists = fileManager.exists('pom.xml');

    if(pomFileExists && !options.exec.commandExists('findsecbugs')) {
      options.logger.warn('pom.xml found but findSecBugs was not found in $PATH');
      options.logger.warn(`${self.key} scan will not run unless you install findSecBugs CLI`);
      options.logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/findsecbugs/README.md');
      return false;
    }
    return pomFileExists;
  };

  const getSeverityFromPriority = priority => {
		if(priority === '1')
			return 'high';
		if(priority === '2')
      return 'medium';
		return 'low';
  };

  const getMitigationMessage = (startLine, endLine) => {
      if(startLine === endLine)
          return `Check line ${startLine}`;
      return `Check lines [${startLine}-${endLine}]`;
  }

  self.run = function(results, done) {
    const findSecBugsCommand = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml -low /target`;

    options.exec.command(findSecBugsCommand, {cwd: '/usr/lib/findsecbugs/'}, () => {

      const parser = new xml2js.Parser({explicitArray: false});
      const report = fileManager.readFileSync('findSecBugsReport.xml');

      parser.parseString(report, (err, findSecBugsResult) => {

  		  findSecBugsResult.BugCollection.BugInstance.forEach(bugInstance => {
  			  const item = {
            code: bugInstance.$.type,
            offender: bugInstance.Method.Message,
            description: bugInstance.LongMessage,
            mitigation: getMitigationMessage(bugInstance.SourceLine.$.start, bugInstance.SourceLine.$.end)
  	      };

     		  const level = getSeverityFromPriority(bugInstance.$.priority);
  	      results[level](item);
        });
      });

      done();
    });
  };

  return Object.freeze(self);
};
