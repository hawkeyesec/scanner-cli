'use strict';
const util = require('./util');
const colors = require('colors');
module.exports = function Logger(options) {
  options = util.defaultValue(options, {});
  const con = util.defaultValue(options.console, console);
  const namespace = options.namespace ? `hawkeye:${options.namespace}` : 'hawkeye';
  const debug = util.defaultValue(options.debug, () => { return require('debug')(namespace); });
  const self = {};
  self.log = function(...args) {
    con.log('[info]', ...args);
  };
  self.warn = function(...args) {
    con.log('[warn]', colors.yellow(...args));
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
