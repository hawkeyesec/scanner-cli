'use strict';
const util = require('./util');
const async = require('async');
require('colors');

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
  options = util.defaultValue(options, {});
  const logger = util.defaultValue(options.logger, () => { return new require('./logger')(); });
  const moduleIndex = new require('./modules')(options);
  const modules = moduleIndex.asArray;
  options.target = moduleIndex.target;

  logger.log('Target for scan:', options.target);
  let self = {};

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

    let modulesToRun = [];
    if(whichModules[0] === 'all') {
      modulesToRun = modules.filter(m => { return m.enabled; });
    } else {
      whichModules.forEach(key => {
        let module = modules.find(m => { return m.key === key; });
        if(util.isEmpty(module)) {
          logger.warn('Unknown module:', key);
        } else {
          modulesToRun.push(module);
        }
      });
    }

    async.forEachSeries(modulesToRun, (module, next) => {
      if(module.handles(options.target)) {
        logger.log('Running module'.bold, module.name);
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
        logger.log('Not Handling', module.name);
        next();
      }
    }, err => {
      let output = generateOutput(results);
      return done(err, output);
    });
  };
  return Object.freeze(self);
};
