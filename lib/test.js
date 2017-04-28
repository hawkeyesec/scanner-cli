'use strict';
const path = require('path');
const content = require(path.join(__dirname, 'languages.json'));
const extensions = {};
content.forEach(name => {
console.log(name);
  name.extensions.forEach(extension => {
    extensions[extension] = name;
  });
});
console.log(extensions);
