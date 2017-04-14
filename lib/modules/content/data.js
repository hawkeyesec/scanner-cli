'use strict';
let defaultFiles = ['js', 'json', 'xml', 'text', 'rb', 'py', 'sh', 'md'];
module.exports = [
  {
    code: 1,
    extension: defaultFiles,
    content: /(['|"]?password['|"]?\ ?[:|=]\ ?['|"].*['|"])/,
    caption: 'Potential password in file',
    level: 'medium'
  },
  {
    code: 2,
    extension: defaultFiles,
    content: /(BEGIN\ RSA\ PRIVATE\ KEY)/,
    caption: 'Private key in file',
    level: 'critical'
  }
];
