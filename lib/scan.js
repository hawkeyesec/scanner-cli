'use strict';
const glob = require('glob');
const path = require('path');
const util = require('./util');
const async = require('async');

let Result = function(name, description, data) {
  return Object.freeze({
    name: name,
    description: description,
    data: data || {}
  });
};

let ModuleResults = function(module) {
  let data = {
    high: [],
    medium: [],
    low: [],
    critical: []
  };
  let self = {};
  self.module = module;

  let handleResult = function(category, ...args) {
    let result = new Result(...args);
    data[category].push(result);
  };
  self.critical = function(...args) {
    handleResult('critical', ...args);
  };
  self.high = function(...args) {
    handleResult('high', ...args);
  };
  self.medium = function(...args) {
    handleResult('medium', ...args);
  };
  self.low = function(...args) {
    handleResult('low', ...args);
  };
  self.results = function() {
    return data;
  };
  return Object.freeze(self);
};

module.exports = function Scan(options) {
  util.enforceArgs(options, ['target']);
  const logger = util.defaultValue(options.logger, () => { return new require('./logger')(); });
  logger.log('target', options.target);
  let self = {};
  let modules = [];
  (function initModules() {
    let pathToModules = path.join(__dirname, 'modules/**/index.js');
    let files = glob.sync(pathToModules);
    files.forEach(path => {
      let module = new require(path)(options);
      logger.log(module.name, 'loaded');
      modules.push(module);
    });
  })();

  let generateOutput = results => {
    return results.map(result => {
      return {
        module: result.module,
        results: result.results()
      };
    });
  };

  self.start = function(whichModules, done) {
    util.enforceNotEmpty(modules, 'You must specify the modules to scan');
    let results = [];

    let modulesToRun;
    if(whichModules[0] === 'all') {
      modulesToRun = modules.filter(m => { return m.enabled; });
    } else {
      modulesToRun = modules.filter(m => {
        return (whichModules.indexOf(m.key) > -1 || whichModules[0] === 'all');
      });
    }

    async.forEachSeries(modulesToRun, (module, next) => {
      if(module.handles()) {
        logger.log(module.name, 'handling');
        let moduleResults = new ModuleResults(module);
        results.push(moduleResults);
        module.run(moduleResults, err => {
          if(err) {
            logger.error(module.name, 'returned an error!');
            console.log('        ' + err.message);
          }
          next();
        });
      } else {
        logger.log(module.name, 'does not handle');
        next();
      }
    }, err => {
      let output = generateOutput(results);
      return done(err, output);
    });
  };
  return Object.freeze(self);
};
