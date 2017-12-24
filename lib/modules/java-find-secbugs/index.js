'use strict';
const util = require('../../util');
const xml2js = require('xml2js');

module.exports = function FindSecBugs(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'FindSecBugs Scan';
  self.description = 'FindSecBugs find common security issues in Java code.';
  self.enabled = true;
  let fileManager;

  const isJavaProject = () => {
    return fileManager.all().some(file => file.endsWith('.java'));
  };

  const getProjectJars = () => {
    const mavenTargetFolder = 'target';
    const gradleBuildFolder = 'build';
    let allFiles = [];

    if(fileManager.exists(mavenTargetFolder)) {
      allFiles = allFiles.concat(fileManager.getAllFilesSync(mavenTargetFolder));
    }

    if(fileManager.exists(gradleBuildFolder)) {
      allFiles = allFiles.concat(fileManager.getAllFilesSync(gradleBuildFolder));
    }
    return allFiles.filter(file => file.endsWith('.jar'));
  };

  const hasJarFiles = () => {
    return getProjectJars().length > 0;
  };

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const isCompiledJavaProject = isJavaProject() && hasJarFiles();

    if(isJavaProject() && !hasJarFiles()) {
      options.logger.warn('java files were found but no jar files');
      options.logger.warn(`${self.key} scan will not run unless you build the project before`);
      return false;
    }

    if(isCompiledJavaProject && !options.exec.commandExists('findsecbugs')) {
      options.logger.warn('java files found but findSecBugs was not found in $PATH');
      options.logger.warn(`${self.key} scan will not run unless you install findSecBugs CLI`);
      options.logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/findsecbugs/README.md');
      return false;
    }

    return isCompiledJavaProject;
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

  const getAbsolutePath = file => {
    return `${fileManager.target}/${file}`;
  };

  self.run = function(results, done) {
    const jarFiles = getProjectJars().map(getAbsolutePath).join(' ');
    const findSecBugsCommand = `findsecbugs -nested:false -progress -effort:max -exitcode -xml:withMessages -output ${fileManager.target}/findSecBugsReport.xml ${jarFiles}`;
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

        const bugs = util.defaultValue(findSecBugsResult.BugCollection.BugInstance, []);

        bugs.forEach(bug => {
  			  const item = {
            code: bug.$.type,
            offender: bug.Method[0].Message[0],
            description: bug.LongMessage[0],
            mitigation: getMitigationMessage(bug.SourceLine)
  	      };

          const level = getSeverity(bug.$.priority);
  	      results[level](item);
        });
      });

      done();
    });
  };

  return Object.freeze(self);
};
