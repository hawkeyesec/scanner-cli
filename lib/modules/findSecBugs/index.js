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

  const isGradleProject = () => {
    return fileManager.exists('gradlew');
  };

  const isMavenProject = () => {
    return fileManager.exists('pom.xml');
  };

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

  const getSeverity = priority => {
		if(priority === '1')
			return 'high';
		if(priority === '2')
      return 'medium';
		return 'low';
  };

  const getSourceLineRange = sourceLine => {
   if(sourceLine.$.start === sourceLine.$.end)
       return `${sourceLine.$.start}`;
    return `[${sourceLine.$.start}-${sourceLine.$.end}]`;
  };

  const getSourceLinesRanges = sourceLines => {
    let sourceLinesRanges = [];

    sourceLines.forEach(sourceLine => {
      sourceLinesRanges.push(getSourceLineRange(sourceLine));
    });
    return sourceLinesRanges.join(', ');
  };

  const getMitigationMessage = sourceLines => {
    return `Check line(s) ${getSourceLinesRanges(sourceLines)}`;
  };

  const getFindSecBugsPath = findSecBugsExecutableLocation => {
    return findSecBugsExecutableLocation.substring(0, findSecBugsExecutableLocation.lastIndexOf('/'));
  };

  self.run = function(results, done) {
    const findSecBugsCommand = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml ${fileManager.target}`;
    const findSecBugsExecutableLocation = options.exec.commandSync(`which findsecbugs`).stdout;
    const findSecBugsPath = getFindSecBugsPath(findSecBugsExecutableLocation);

    options.exec.command(findSecBugsCommand, {cwd: findSecBugsPath }, (err, data) => {

      if(err) {
        options.logger.warn(`There was an error while executing FindSecBugs: ${err}`);
        return done();
      }

      if(!fileManager.exists('findSecBugsReport.xml')) {
        options.logger.error(`There was an error while executing FindSecBugs and the report was not created: ${JSON.stringify(data.stderr)}`);
        return done();
      }

      const parser = new xml2js.Parser();
      const report = fileManager.readFileSync('findSecBugsReport.xml');

      parser.parseString(report, (err, findSecBugsResult) => {

        if(!findSecBugsResult.BugCollection.BugInstance)
          return done();

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

  return Object.freeze(self);
};
