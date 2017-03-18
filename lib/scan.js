'use strict';
const logger = new require('./logger')();
const glob = require('glob');
const path = require('path');
const util = require('./util');
const async = require('async');

module.exports = function Scan(target) {
  util.enforceNotEmpty(target);
  logger.log('target', target);
  let self = {};
  let modules = [];
  (function initModules() {
    let files = glob.sync(path.join(__dirname, 'modules', '*.js'));
    files.forEach(path => {
      let module = new require(path)(target);
      logger.log(module.name, 'loaded');
      modules.push(module);
    });
  })();

  self.all = function(done) {
    async.forEachSeries(modules, (module, next) => {
      if(module.handles()) {
        logger.log(module.name, 'handling');
        module.run(next);
      } else {
        logger.log(module.name, 'does not handle');
        next();
      }
    }, done);
  };
  return Object.freeze(self);
};
