'use strict';
const fs = require('fs');
module.exports = function JsonWriter() {
  let self = {};
  self.write = function(path, results) {
    fs.writeFileSync(path, JSON.stringify(results, null, 2));
  };
  return Object.freeze(self);
};
