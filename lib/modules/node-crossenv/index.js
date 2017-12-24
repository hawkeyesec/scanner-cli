'use strict';
const util = require('../../util');
const async = require('async');

module.exports = function Nsp(options) {
  options = util.defaultValue(options, {});
  options = util.permittedArgs(options, ['exec']);
  options.exec = util.defaultValue(options.exec, () => { return new require('../../exec')(); });

  const self = {};
  self.key = require('path').basename(require('path').dirname(__filename));
  self.name = 'Node CrossEnv malware check';
  self.description = 'Scans a package.json for known malicious crossenv packages';
  self.enabled = true;

  let fileManager;
  self.handles = function(manager) {
    util.enforceType(manager, Object);
    fileManager = manager;
    return fileManager.exists('package.json');
  };

  /* jshint maxcomplexity: 6 */
  self.run = function(results, done) {
    const json = JSON.parse(fileManager.readFileSync('package.json'));
    const badPackages = [
      'babelcli',
      'cross-env.js',
      'crossenv',
      'd3.js',
      'fabric-js',
      'ffmepg',
      'gruntcli',
      'http-proxy.js',
      'jquery.js',
      'mariadb',
      'mongose',
      'mssql-node',
      'mssql.js',
      'mysqljs',
      'node-fabric',
      'node-opencv',
      'node-opensl',
      'node-openssl',
      'node-sqlite',
      'node-tkinter',
      'nodecaffe',
      'nodefabric',
      'nodeffmpeg',
      'nodemailer-js',
      'nodemailer.js',
      'nodemssql',
      'noderequest',
      'nodesass',
      'nodesqlite',
      'opencv.js',
      'openssl.js',
      'proxy.js',
      'shadowsock',
      'smb',
      'sqlite.js',
      'sqliter',
      'sqlserver',
      'tkinter',
    ];
    const validateDependencies = obj => {
      const validate = (k, v) => {
        if(badPackages.indexOf(v) > -1) {
            const item = {
              code: '1',
              offender: v,
              description: 'node-crossenv malware found',
              mitigation: 'http://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry',
              data: {}
            };
            results.critical(item);
        }
      };
      async.eachOf(obj, validate);
    };
    if(json.dependencies) { validateDependencies(json.dependencies); }
    if(json.devDependencies) { validateDependencies(json.devDependencies); }
    if(json.optionalDependencies) { validateDependencies(json.optionalDependencies); }
    done();
  };
  return Object.freeze(self);
};
