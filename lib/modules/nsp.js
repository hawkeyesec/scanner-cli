'use strict';
const fs = require('fs');
const path = require('path');
const exec = new require('../exec')();

module.exports = function Nsp(target) {
  let self = {};
  self.name = 'Node Security Project';
  self.description = 'Scans a package.json for known vulnerabilities from NSP';
  self.handles = function() {
    return fs.existsSync(path.join(target, 'package.json'));
  };
  self.run = function(done) {
    exec.command(path.join(__dirname, '../../node_modules/nsp/bin/nsp') + ' check', false, done);
  };
  return Object.freeze(self);
};
