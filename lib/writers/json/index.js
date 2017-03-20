'use strict';
const fs = require('fs');
const util = require('../../util');
const logger = new require('../../logger')();

module.exports = function JsonWriter(options) {
  options = util.defaultValue(options, {});
  util.enforceArgs(options, ['path']);
  const self = {
    key: 'json'
  };
  self.write = function(results) {
    fs.writeFileSync(options.path, JSON.stringify(results, null, 2));
    logger.log('json results saved to', options.path);
  };
  return Object.freeze(self);
};
