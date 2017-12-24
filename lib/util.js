'use strict';
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const istext = require('istextorbinary');
require('colors');

module.exports = {
  /* enforces mandatory arguments, accepts a hash and a singular
     or list of keys to enforce on that hash.
     for example, enforceArgs({ a: 'b' }, ['a']);
     would valiate that the hash has a key of a */
  enforceArgs: function(hash, args, limitToo) {
    ((args instanceof Array) ? args : [args]).forEach(arg => {
      const value = _.get(hash, arg);
      if(value === undefined || value === null) {
        throw new Error(arg + ' is a required argument');
      }
    });
    if(limitToo) {
      this.limitArgs(hash, args);
    }
  },
  /* sets a list of acceptable yet optional arguments */
  permittedArgs: function(hash, args) {
    return _.pick(hash, args);
  },
  enforceValue: function(value, allowed) {
    if(allowed.indexOf(value) === -1) {
      throw new Error(value + ' is not in the accepted range of values: ' + allowed.join(','));
    }
  },
  /* this will limit the number of items in the args array.
     if you only pass a singular min, then itll be fixed length, otherwise
     it will be a range.
     for example: util.argsLength(arguments, 1, 2) would enforce the arguments
     has a length of between 1 and 2. NOTE: You cant use this inside
     an es6 lambda function, as the scope of arguments would be incorrect */
  argsLength: function(args, min, max, fromNew) {
    if(!fromNew) {
      console.warn('argsLength is deprecated, please use enforceArgsLength!'.yellow);
    }
    /* jshint maxcomplexity: 5 */
    if(!max) { max = min; }
    if(args.length < min || args.length > max) {
      throw new Error('Unexpected number of arguments (' + args.length + ')');
    }
  },
  /* this is the correctly named function, but const the old one in
     so it isnt a breaking change */
  enforceArgsLength: function(args, min, max) {
    return this.argsLength(args, min, max, true);
  },
  /* this will limit the keys that are avaialble on a hash, but
     not enforce them */
  limitArgs: function(hash, args) {
    args = (args instanceof Array) ? args : [args];
    Object.keys(hash).forEach(key => {
      if(args.indexOf(key) === -1) {
        throw new Error('Unexpected argument: ' + key);
      }
    });
  },
  /* this will check if a value is null or undefined.
     if you pass true as the second arg, it'll throw as well */
  isEmpty: function(value, throwError) {
    /* jshint maxcomplexity:  5 */
    const result = (value === undefined || value === null);
    if(result && throwError) {
      if(throwError instanceof Error) {
        throw throwError;
      }
      if(typeof throwError === 'string') {
        throw new Error(throwError);
      }
      throw new Error('Null or undefined value when one was expected');
    }
    return result;
  },
  defaultValue: function(thing, value) {
    const getValue = () => {
      if(typeof value === 'function') {
        return value();
      }
      return value;
    };
    thing = (this.isEmpty(thing) ? getValue() : thing);
    return thing;
  },
  /* this will always throw if the value is null or empty */
  enforceNotEmpty: function(args, error) {
    args = (args instanceof Array) ? args : [args];
    args.forEach(value => {
      this.isEmpty(value, error || true);
    });
  },
  /* this will enforce the type of the object */
  enforceType: function(value, type) {
    if(!(value instanceof type)) {
      throw new Error('Expected value to be of type: ' + typeof type);
    }
  },
  clone: function(object) {
    return _.cloneDeep(object);
  },
  moduleResolve: function(module) {
    if(__dirname.indexOf('node_modules') > -1) {
      return path.join(__dirname, '../../', module);
    } else {
      return path.join(__dirname, '../node_modules', module);
    }
  },
  readFileSync: function(absolute) {
    const stat = fs.statSync(absolute);
    if(stat.size > 1000000) {
      console.warn(('[warn] File which exceeds 1MB limited detected: ' + absolute).yellow);
      return '';
    }
    const buffer = fs.readFileSync(absolute);
    if(!istext.isTextSync(absolute, buffer)) {
      console.warn(('[warn] Binary file detected when expected text: ' + absolute).yellow);
      return '';
    }
    const contents = buffer.toString().trim();
    return contents;
  },
  readFile: function(absolute, done) {
    return done(null, this.readFileSync(absolute));
  },
  existsSync: function(absolute) {
    return fs.existsSync(absolute);
  }
};
