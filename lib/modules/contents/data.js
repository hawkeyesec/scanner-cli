'use strict';
module.exports = [
  {
    code: 1,
    content: /(['|"]?password['|"]?\ ?[:|=]\ ?['|"].*['|"])/,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 2,
    content: /(BEGIN\ RSA\ PRIVATE\ KEY)/,
    caption: 'Private key in file',
    level: 'critical'
  },
  {
    code: 3,
    content: /(['|"|_]?password['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 4,
    content: /(['|"|_]?password['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 5,
    content: /(['|"|_]?pw['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 6,
    content: /(['|"|_]?pass['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 7,
    content: /(['|"|_]?pword['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 8,
    content: /(['|"|_]?passphrase['|"]?\ *[:|=])^[,|;]{8,}/i,
    caption: 'Potential passphrase in file',
    level: 'low'
  },
  {
    code: 9,
    content: /(<[^(><.)]+password[^(><.)]+>[^(><.)]+<\/[^(><.)]+password[^(><.)]+>)/i,
    caption: 'Potential password in file',
    level: 'low'
  },
  {
    code: 10,
    content: /(<[^(><.)]+passphrase[^(><.)]+>[^(><.)]+<\/[^(><.)]+passphrase[^(><.)]+>)/i,
    caption: 'Potential passphrase in file',
    level: 'low'
  },
  {
    code: 11,
    content: /(<ConsumerKey>\S*<\/ConsumerKey>)/i,
    caption: 'Potential Apigee Key in file',
    level: 'low'
  },
  {
    code: 12,
    content: /(<ConsumerSecret>\S*<\/ConsumerSecret>)/i,
    caption: 'Potential Apigee Secret in file',
    level: 'low'
  },
  {
    code: 13,
    content: /(AWS[ |\w]+key[ |\w]+[:|=])/i,
    caption: 'Potential AWS Key in file',
    level: 'low'
  },
  {
    code: 14,
    content: /(AWS[ |\w]+secret[ |\w]+[:|=])/i,
    caption: 'Potential AWS Secret in file',
    level: 'low'
  },


];
