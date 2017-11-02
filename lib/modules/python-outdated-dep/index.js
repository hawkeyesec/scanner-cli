'use strict';
const path = require('path');
const semver = require('semver');
const util = require('../../util');


module.exports = function PythonOutdatedDep(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = 'pythonOutdatedDepScan';
  self.name = 'Python Outdated Dependencies Scan';
  self.description = 'Scans a requirements.txt for out of date packages';
  self.enabled = true;

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    const requirements = fileManager.exists('requirements.txt');
    if(requirements && !options.exec.commandExists('piprot')) {
      options.logger.warn('requirements.txt found but piprot not found in $PATH');
      options.logger.warn(self.key + ' will not run unless you install piprot');
      options.logger.warn('Please see: https://github.com/sesh/piprot');
      return false;
    }
    return requirements;
  };

  const getModules = json => { return deps = util.defaultValue(json, {}); };
  const getCurrentVersion = line => { return line.substring(line.indexOf('(')+1, line.indexOf(')')) };
  const getDependency = line => { return line.substring(0, line.indexOf('(')).trim() };
  const getLatestVersion = line => { return line.substring(line.lastIndexOf(' ')+1) };
  const getVulnerabilities = (lines) => {
    return lines.map(line => {
      const latestVersion = getLatestVersion(line);
      const severity = getSeverity(getCurrentVersion(line), latestVersion);
      return {
        dependency: getDependency(line),
        mitigation: 'Update to ' + latestVersion,
        description: getDescription(severity),
        severity: severity
      }
    });
  };

  const versionIsValid = version => { return semver.valid(version) };

  const getSeverity = (currentVersion, latestVersion) => {
    if(!versionIsValid(currentVersion) || !versionIsValid(latestVersion))
      return 'low';

    if(semver.minor(currentVersion) < semver.minor(latestVersion))
      return 'medium';

    if(semver.major(currentVersion) < semver.major(latestVersion))
      return 'high';
    return 'low';
  }

  const getDescription = (severity) => {
    if(severity === 'medium')
      return 'Module is one or more minor versions out of date';
    if(severity === 'high')
      return 'Module is one or more major versions out of date';
    return 'Module is one or more patch versions out of date';
  }

  const getLines = data => { return data.stdout.split('\n'); }

  const getCode = severity => {
    if(severity === 'high')
      return 1;
    if(severity === 'medium')
      return 2;
    return 3;
  }

  const parseResult = (vulnerability, results) => {
    results[vulnerability.severity](
      {
        code: getCode(vulnerability.severity),
        offender: vulnerability.dependency,
        description: vulnerability.description,
        mitigation: vulnerability.mitigation
      }
    );
  }

  self.run = function(results, done) {
    const piprotCommand = 'piprot -o'

    options.exec.command(piprotCommand, {
      cwd: fileManager.target
    }, (err, data) => {
      let lines = getLines(data);
      lines.pop();

      if(lines.length === 0)
        return done()

      getVulnerabilities(lines).forEach(vulnerability => {
        parseResult(vulnerability, results);
      });

      done();
    });
  };
  return Object.freeze(self);
};
