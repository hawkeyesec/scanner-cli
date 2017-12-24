'use strict';
const semver = require('semver');
const util = require('../../util');

const LOW_SEVERITY = 'low';
const MEDIUM_SEVERITY = 'medium';
const HIGH_SEVERITY = 'high';

class Vulnerability {
  constructor(dependency, currentVersion, latestVersion) {
    this.dependency = dependency;
    this.currentVersion = currentVersion;
    this.latestVersion = latestVersion;
  }

  get description() {
    if(this.severity === MEDIUM_SEVERITY)
      return 'Module is one or more minor versions out of date';
    if(this.severity === HIGH_SEVERITY)
      return 'Module is one or more major versions out of date';
    return 'Module is one or more patch versions out of date';
  }

  get mitigation() {
    return `Update to ${this.latestVersion}`;
  }

  _versionIsValid(version) { return semver.valid(version) }

  get severity() {
    /* jshint maxcomplexity: 7 */
    if(!this._versionIsValid(this.currentVersion) || !this._versionIsValid(this.latestVersion))
      return LOW_SEVERITY;

    if(semver.minor(this.currentVersion) < semver.minor(this.latestVersion))
      return MEDIUM_SEVERITY;

    if(semver.major(this.currentVersion) < semver.major(this.latestVersion))
      return HIGH_SEVERITY;
    return LOW_SEVERITY;
  }
}

class VulnerabilityParser {
  constructor(result) {
    this.result = result;
  }

  _parseCurrentVersion() { return this.result.substring(this.result.indexOf('(')+1, this.result.indexOf(')')) }
  _parseDependency() { return this.result.substring(0, this.result.indexOf('(')).trim() }
  _parseLatestVersion() { return this.result.substring(this.result.lastIndexOf(' ')+1) }

  parse() {
    return new Vulnerability(
      this._parseDependency(),
      this._parseCurrentVersion(),
      this._parseLatestVersion()
    );
  }
}

class PiprotResultParser {
  constructor(result) {
    this.lines = this._getLines(result);
    this._removePiprotInformationLine();
  }

  _getLines(result) { return result.stdout.split('\n'); }
  _removePiprotInformationLine() { this.lines.pop() }
  get vulnerabilities() {
    return this.lines.map(line => {
      return new VulnerabilityParser(line).parse();
    });
  }
}

class Logger {
  constructor(vulnerability, results) {
    this.vulnerability = vulnerability;
    this.results = results;
  }

  _getCode() {
    if(this.vulnerability.severity === HIGH_SEVERITY)
      return 1;
    if(this.vulnerability.severity === MEDIUM_SEVERITY)
      return 2;
    return 3;
  }

  log() {
    this.results[this.vulnerability.severity](
      {
        code: this._getCode(),
        offender: this.vulnerability.dependency,
        description: this.vulnerability.description,
        mitigation: this.vulnerability.mitigation
      }
    );
  }
}

module.exports = function PythonOutdatedDep(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec', 'logger']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Python Outdated Dependencies Scan';
  self.description = 'Scans a requirements.txt for out of date packages';
  self.enabled = true;

  let fileManager;
  self.handles = manager => {
    util.enforceType(manager, Object);
    fileManager = manager;
    const requirements = fileManager.exists('requirements.txt');
    if(requirements && !options.exec.commandExists('piprot')) {
      options.logger.warn('requirements.txt found but piprot not found in $PATH');
      options.logger.warn(`${self.key} will not run unless you install piprot`);
      options.logger.warn('Please see: https://github.com/sesh/piprot');
      return false;
    }
    return requirements;
  };

  self.run = (results, done) => {
    options.exec.command('piprot -o', {
      cwd: fileManager.target
    }, (err, data) => {
      let vulnerabilities = new PiprotResultParser(data).vulnerabilities;

      if(vulnerabilities.length === 0)
        return done();

      vulnerabilities.forEach(vulnerability => {
        new Logger(vulnerability, results).log();
      });

      done();
    });
  };
  return Object.freeze(self);
};
