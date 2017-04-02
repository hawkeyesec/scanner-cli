'use strict';
const glob = require('glob');
const path = require('path');
const util = require('../util');
const fs = require('fs');
require('colors');

module.exports = function Modules(options) {
  options = util.defaultValue(options, {});
  options.target = util.defaultValue(options.target, process.env.PWD);
  options.target = util.defaultValue(options.target, '/target');
  options.logger = util.defaultValue(options.logger, () => { return new require('../logger')(); });

  (function enforceTarget() {
    if(!fs.existsSync(options.target)) {
      options.logger.error('We were unable to infer the target directory');
      console.log('        We checked the $PWD variable and /target.');
      console.log('');
      console.log('        Please run with the --target flag');
      process.exit(1);
    }
  })();

  const pathToModules = path.join(__dirname, '*/**/index.js');
  const files = glob.sync(pathToModules);
  const modules = {
    target: path.resolve(options.target),
    byId: {},
    asArray: []
  };

  files.forEach(file => {
    const Constructor = require(file);
    const instance = new Constructor(options);
    options.logger.log(instance.name.bold, 'dynamically loaded') ;
    modules[Constructor.name] = Constructor;
    modules.byId[instance.key] = instance;
    modules.asArray.push(instance);
  });

  return Object.freeze(modules);
};
