'use strict';
const fs = require('fs');
const path = require('path');
const util = require('./util');

module.exports = function Rc(options) {
  options = util.defaultValue(options, {});
  let self = {
    exclude: [
      '^node_modules/',
      '^.git/',
      '^.git-crypt/'
    ],
    logger: util.defaultValue(options.logger, () => { return require('./logger')(); }),
      failOn: 'low',
    modules: ['all'],
    all: false
  };

  let withModule = module => {
    if(self.modules[0] === 'all') {
      self.modules = [module];
    } else {
      self.modules.push(module);
    }
    return self;
  };

  let withExclude = exclude => {
    self.exclude.push(exclude);
    return self;
  };

  let withTarget = target => {
    target = util.defaultValue(target, process.env.PWD);
    target = util.defaultValue(target, '/target');

    (function enforceTarget() {
      if(!fs.existsSync(target)) {
        self.logger.error('We were unable to infer the target directory');
        console.log('        We checked the $PWD variable and /target.');
        console.log('');
        console.log('        Please run with the --target flag');
        process.exit(1);
      }
    })();

    /*jshint maxcomplexity: 30 */
    self.target = path.resolve(target);

    const rcFile = path.join(self.target, '.hawkeyerc');
    const rcExclude = path.join(self.target, '.hawkeyeignore');
    if(fs.existsSync(rcFile)) {
      self.logger.log('.hawkeyerc detected in project root');
      const hawkeyerc = JSON.parse(fs.readFileSync(rcFile));

      const handlers = {
        modules: modules => {
          modules.forEach(self.withModule);
        },
        sumo: self.withSumo,
        json: self.withJson,
        failOn: self.withFailOn
      };
      Object.keys(hawkeyerc).forEach(key => {
        const handler = handlers[key];
        if(util.isEmpty(handler)) {
          throw new Error('Unknown hawkeyerc option: ' + key);
        }
        handler(hawkeyerc[key]);
      });
    }

    if(fs.existsSync(rcExclude)) {
      self.logger.log('.hawkeyeignore detected in project root');
      const hawkeyeignore = fs.readFileSync(rcExclude).toString().trim().split('\n');
      hawkeyeignore.forEach(withExclude);
    }
    return self;
  };

  let withFailOn = level => {
    if(['low', 'medium', 'high', 'critical'].indexOf(level) === -1) {
      throw new Error(`${level} is not an valid fail level`);
    }
    self.failOn = level;
    return self;
  };

  let withJson = path => {
    self.json = path;
    return self;
  };

  let withSumo = url => {
    self.sumo = url;
    return self;
  };

  let withHttp = url => {
    self.http = url;
    return self;
  };

  let addProperty = (key, handler) => {
    Object.defineProperty(self, key, { enumerable: false, value: handler });
  };

  addProperty('withExclude', withExclude);
  addProperty('withTarget', withTarget);
  addProperty('withFailOn', withFailOn);
  addProperty('withModule', withModule);
  addProperty('withSumo', withSumo);
  addProperty('withHttp', withHttp);
  addProperty('withJson', withJson);

  return self;
};
