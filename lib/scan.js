'use strict';
const util = require('./util');
const FileManager = require('./fileManager');
const async = require('async');
require('colors');

const Result = function(module, options) {
  util.enforceArgs(options, ['code', 'offender', 'description', 'mitigation']);
  options.data = util.defaultValue(options.data, {});
  options.code = module + '-' + options.code;
  return Object.freeze(options);
};

const ModuleResults = function(module) {
  const data = {
    high: [],
    medium: [],
    low: [],
    critical: []
  };
  const self = {};
  self.module = module;

  const handleResult = function(category, ...args) {
    const result = new Result(module.key, ...args);
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

module.exports = function Scan(rc) {
  rc = util.defaultValue(rc, {});

  const logger = util.defaultValue(rc.logger, () => { return new require('./logger')(); });
  const moduleIndex = new require('./modules')(rc);
  const modules = moduleIndex.asArray;
  rc.target = moduleIndex.target;
  const fileManager = new FileManager(rc);

  logger.log('Target for scan:', rc.target);
  const self = {};

  const generateOutput = results => {
    return results.map(result => {
      var tmpresults = result.results();
      switch (rc.threshold) {
        case 'critical':
          delete tmpresults.high;
          delete tmpresults.medium;
          delete tmpresults.low;
          break;
        case 'high':
          delete tmpresults.medium;
          delete tmpresults.low;
          break;
        case 'medium':
          delete tmpresults.low;
          break;
        default:
          break;
      }
      return {
        module: result.module,
        results: result.results()
      };
    });
  };

  self.start = function(done) {
    util.enforceNotEmpty(modules, 'You must specify the modules to scan');
    const results = [];

    let modulesToRun = [];
    const whichModules = rc.modules;
    if(whichModules[0] === 'all') {
      modulesToRun = modules.filter(m => { return m.enabled; });
    } else {
      whichModules.forEach(key => {
        const module = modules.find(m => { return m.key === key; });
        if(util.isEmpty(module)) {
          logger.warn('Unknown module:', key);
        } else {
          modulesToRun.push(module);
        }
      });
    }

    async.forEachSeries(modulesToRun, (module, next) => {
      if(module.handles(fileManager)) {
        logger.log('Running module'.bold, module.name);
        const moduleResults = new ModuleResults(module,rc);
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
      const output = generateOutput(results);
      return done(err, output);
    });
  };
  return Object.freeze(self);
};
