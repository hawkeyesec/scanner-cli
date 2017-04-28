'use strict';
module.exports = [
  {
    code: 1,
    content: /(['|"]?password['|"]?\ ?[:|=]\ ?['|"].*['|"])/,
    caption: 'Potential password in file',
    level: 'medium'
  },
  {
    code: 2,
    content: /(BEGIN\ RSA\ PRIVATE\ KEY)/,
    caption: 'Private key in file',
    level: 'critical'
  }
];
