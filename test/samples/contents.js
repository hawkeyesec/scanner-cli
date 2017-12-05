'use strict';
let defaultFiles = ['js', 'json', 'xml', 'text', 'rb', 'py', 'sh', 'md'];
module.exports = [
  {
    extension: defaultFiles,
    content: /(['|"]?password['|"]?\ ?[:|=]\ ?['|"].*['|"])/,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    extension: defaultFiles,
    content: /(BEGIN\ RSA\ PRIVATE\ KEY)/,
    caption: 'Private key in file',
    level: 'critical'
  }
];
