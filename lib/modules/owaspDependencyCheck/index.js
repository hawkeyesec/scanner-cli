'use strict';
const util = require('../../util');

module.exports = function OwaspDependencyCheck(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'dependency-check';
  self.name = 'Owasp Dependency Check Scan';
  self.description = 'Scan the dependencies of a Java project.';
  self.enabled = true;
  let fileManager;

  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const isCompiledJavaProject = isJavaProject() && hasJarFiles();

    if(isJavaProject() && !hasJarFiles()) {
      options.logger.warn('java files were found but no jar files');
      options.logger.warn(`${self.key} scan will not run unless you build the project before`);
      return false;
    }
 
    if(isCompiledJavaProject && !options.exec.commandExists('dependency-check')) {
      options.logger.warn('java files found but dependency-check was not found in $PATH');
      options.logger.warn(`${self.key} scan will not run unless you install Owasp Dependency Check CLI`);
      options.logger.warn('Installation instructions: https://github.com/Stono/hawkeye/blob/master/lib/modules/owaspDependencyCheck/README.md');
      return false;
     }
 
    return isCompiledJavaProject;
  };

  const isJavaProject = () => {
    return fileManager.all().some(file => file.endsWith('.java'));
  };

  const hasJarFiles = () => {
    return getProjectJars().length > 0;
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

  const getAbsolutePath = file => {
    return `${fileManager.target}/${file}`;
  };
  
  self.run = function(results, done) {
    const jarFiles = getProjectJars().map(getAbsolutePath).join(' ');

    const owaspCheckCommand = `dependency-check --project Testing --format JSON --out . -s ${jarFiles}`;

    options.exec.command(owaspCheckCommand,{}, (err, data) => {

      if(err) {
        options.logger.warn(`There was an error while executing Owasp Dependency Check: ${err}`);
        return done();
      }

      if(!fileManager.exists('dependency-check-report.json')) {
        options.logger.error(`There was an error while executing Owasp Dependency Check and the report was not created: ${JSON.stringify(data.stderr)}`);
        return done();
      }

      const report = fileManager.readFileSync('dependency-check-report.json');
      const parsedReport = JSON.parse(report);
      const dependencies = parsedReport.dependencies;

      dependencies.forEach(dependency => {
	if(dependency.vulnerabilities != undefined){
	  const vulnerabilities = dependency.vulnerabilities.forEach(vulnerability => {
	    const mitigationUrls = vulnerability.references.map(ref => {
	      return ref.url;
	    });

	    const mitigation = mitigationUrls.join(', ');

	    const item = {
	      code: vulnerability.name,
	      offender: dependency.fileName,
	      description: `https://nvd.nist.gov/vuln/detail/${vulnerability.name}`,
	      mitigation: mitigation
	    };

	    results[vulnerability.severity.toLowerCase()](item);
	    
	  });
	}
	
      });

      done();
    });
  };

  return Object.freeze(self);
};    
