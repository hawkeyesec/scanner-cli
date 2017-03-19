'use strict';
const util = require('./util');
const colors = require('colors');
module.exports = function Logger(options) {
  options = util.defaultValue(options, {});
  let con = util.defaultValue(options.console, console);
  let debug = util.defaultValue(options.debug, () => { require('debug')('hawkeye'); });
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
