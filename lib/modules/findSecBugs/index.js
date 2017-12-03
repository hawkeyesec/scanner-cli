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
    let isJavaProject = isGradleProject() || isMavenProject();
    if(isJavaProject && !options.exec.commandExists('findsecbugs')) {
      options.logger.warn('pom.xml found but findSecBugs was not found in $PATH');
      options.logger.warn(`${self.key} scan will not run unless you install findSecBugs CLI`);
      options.logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/findsecbugs/README.md');
      return false;
    }
    return isJavaProject;
  };

  const isGradleProject = () => {
    return fileManager.exists('gradlew');
  }

  const isMavenProject = () => {
    return fileManager.exists('pom.xml');
  };

  self.run = function(results, done) {
    const findSecBugsCommand = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml -low /target`;
    options.exec.command(findSecBugsCommand, {cwd: '/usr/lib/findsecbugs/'}, () => {

      if(!fileManager.exists('findSecBugsReport.xml')) {
        options.logger.error('There was an error while executing FindSecBugs and the report was not created.');
        return done();
      }

      const parser = new xml2js.Parser();
      const report = fileManager.readFileSync('findSecBugsReport.xml');

      parser.parseString(report, (err, findSecBugsResult) => {
  		  findSecBugsResult.BugCollection.BugInstance.forEach(bugInstance => {
  			  const item = {
            code: bugInstance.$.type,
            offender: bugInstance.Method[0].Message[0],
            description: bugInstance.LongMessage[0],
            mitigation: getMitigationMessage(bugInstance.SourceLine)
  	      };

          const level = getSeverity(bugInstance.$.priority);
  	      results[level](item);
        });
      });

      done();
    });
  };

  const getSeverity = priority => {
		if(priority === '1')
			return 'high';
		if(priority === '2')
      return 'medium';
		return 'low';
  };

  const getSourceLinesRanges = sourceLines => {
    let sourceLinesRanges = [];

    sourceLines.forEach(sourceLine => {
      sourceLinesRanges.push(getSourceLineRange(sourceLine));
    });
    return sourceLinesRanges.join(', ');
  };

  const getSourceLineRange = sourceLine => {
   if(sourceLine.$.start === sourceLine.$.end)
       return `${sourceLine.$.start}`;
    return `[${sourceLine.$.start}-${sourceLine.$.end}]`;
  };

  const getMitigationMessage = (sourceLines) => {
    return `Check line(s) ${getSourceLinesRanges(sourceLines)}`;
  };

  return Object.freeze(self);
};
