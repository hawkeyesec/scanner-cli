'use strict';
const util = require('./util');
const colors = require('colors');
module.exports = function Logger(options) {
  options = util.defaultValue(options, {});
  let con = util.defaultValue(options.console, console);
  let namespace = 'hawkeye';
  if(options.namespace) {
    namespace = namespace + ':' + options.namespace;
  }
  let debug = util.defaultValue(options.debug, () => { return require('debug')(namespace); });
  let self = {};
  self.log = function(...args) {
    con.log('[info]', ...args);
  };
  self.warn = function(...args) {
    con.log('[warn]', ...args);
  };
  self.error = function(...args) {
    con.error('[error]', colors.red(...args));
  };
  self.debug = function(...args) {
    debug(...args);
  };
  self.log = self.log;
  return Object.freeze(self);
};
