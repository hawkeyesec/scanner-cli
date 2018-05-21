'use strict';
const fs = require('fs');
const path = require('path');
const util = require('./util');
const isValidPath = require('is-valid-path');

module.exports = function Rc(options) {
  options = util.defaultValue(options, {});
  const isValidUrl = (userInput) => {
    var urlregex = /^(https?):\/\/.*$/;
    if(!urlregex.test(userInput)) {
      throw new Error('Invalid URL: ' + userInput);
    }
  };

  const isValidLimit = (limit) => Number.isInteger(limit) && limit > 0;
  const defaultFileLimit = 1000;

  let self = {
    exclude: [
      '^node_modules/',
      '^.git/',
      '^.git-crypt/',
      'package-lock.json'
    ],
    logger: util.defaultValue(options.logger, () => { return require('./logger')(); }),
    failOn: 'low',
    modules: ['all'],
    all: false,
    staged: false,
    defaultFileLimit,
    fileLimit: util.defaultValue(options.fileLimit, defaultFileLimit)
  };

  let withModule = module => {
    if(self.modules[0] === 'all') {
      self.modules = [module];
    } else if(self.modules.indexOf(module) === -1) {
      self.modules.push(module);
    }
    return self;
  };

  let withExclude = exclude => {
    if(exclude.length === 0) { return; }
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
    if(!isValidPath(target)) {
      throw new Error(target + ' is not a valid path');
    }

    /*jshint maxcomplexity: 30 */
    self.target = path.resolve(target);

    const rcFile = path.join(self.target, '.hawkeyerc');
    const rcExclude = path.join(self.target, '.hawkeyeignore');
    if(fs.existsSync(rcFile)) {
      self.logger.log('.hawkeyerc detected in project root');
      const hawkeyerc = JSON.parse(util.readFileSync(rcFile));

      const handlers = {
        modules: modules => {
          modules.forEach(self.withModule);
        },
        sumo: self.withSumo,
        http: self.withHttp,
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
      const hawkeyeignore = util.readFileSync(rcExclude).split('\n');
      hawkeyeignore.forEach(withExclude);
    }
    return self;
  };

  let withThreshold = level => {
    if(['low', 'medium', 'high', 'critical'].indexOf(level) === -1) {
      throw new Error(`${level} is not an valid fail level`);
    }
    self.threshold = level;
    console.log('level '+level);
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
    if(!isValidPath(path)) {
      throw new Error(path + ' is not a valid path');
    }
    self.json = path;
    return self;
  };

  let withSumo = url => {
    isValidUrl(url);
    self.sumo = url;
    return self;
  };

  let withHttp = url => {
    isValidUrl(url);
    self.http = url;
    return self;
  };

  let setFileLimit = (limit) => {
    if (!isValidLimit(limit)) {
      throw new Error('File limit should be a positive integer');
    }
    self.fileLimit = limit;
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
  addProperty('withThreshold', withThreshold);
  addProperty('setFileLimit', setFileLimit);

  return self;
};
