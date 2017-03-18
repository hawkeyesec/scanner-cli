'use strict';
let defaultFiles = /^(js|json|xml|text|rb|py|sh|md)$/;
module.exports = [
  {
    extension: defaultFiles,
    content: /(['|"]?password['|"]?\ ?[:|=]\ ?['|"].*['|"])/,
    caption: 'Potential password in file',
    level: 'medium'
  },
  {
    extension: defaultFiles,
    content: /(BEGIN\ RSA\ PRIVATE\ KEY)/,
    caption: 'Potential private key in file',
    level: 'critical'
  }
];
