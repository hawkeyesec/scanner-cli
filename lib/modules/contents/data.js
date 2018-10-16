'use strict'
module.exports = [
  {
    code: 1,
    regex: /(['|"]?password['|"]? ?[:|=] ?['|"]?.*['|"]?)/,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 2,
    regex: /(BEGIN RSA PRIVATE KEY)/,
    description: 'Private key in file',
    level: 'critical'
  },
  {
    code: 3,
    regex: /(['|"|_]?password['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 4,
    regex: /(['|"|_]?password['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 5,
    regex: /(['|"|_]?pw['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 6,
    regex: /(['|"|_]?pass['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 7,
    regex: /(['|"|_]?pword['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 8,
    regex: /(['|"|_]?passphrase['|"]? *[:|=])^[,|;]{8,}/i,
    description: 'Potential passphrase in file',
    level: 'low'
  },
  {
    code: 9,
    regex: /(<[^(><.)]+password[^(><.)]+>[^(><.)]+<\/[^(><.)]+password[^(><.)]+>)/i,
    description: 'Potential password in file',
    level: 'low'
  },
  {
    code: 10,
    regex: /(<[^(><.)]+passphrase[^(><.)]+>[^(><.)]+<\/[^(><.)]+passphrase[^(><.)]+>)/i,
    description: 'Potential passphrase in file',
    level: 'low'
  },
  {
    code: 11,
    regex: /(<ConsumerKey>\S*<\/ConsumerKey>)/i,
    description: 'Potential Apigee Key in file',
    level: 'low'
  },
  {
    code: 12,
    regex: /(<ConsumerSecret>\S*<\/ConsumerSecret>)/i,
    description: 'Potential Apigee Secret in file',
    level: 'low'
  },
  {
    code: 13,
    regex: /(AWS[ |\w]+key[ |\w]+[:|=])/i,
    description: 'Potential AWS Key in file',
    level: 'low'
  },
  {
    code: 14,
    regex: /(AWS[ |\w]+secret[ |\w]+[:|=])/i,
    description: 'Potential AWS Secret in file',
    level: 'low'
  }
]
