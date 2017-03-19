'use strict';
module.exports = [
  {
    part: 'filename',
    type: 'regex',
    pattern: /^.*_rsa$/,
    caption: 'Private SSH key',
    level: 'critical',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^.*_dsa$/,
    caption: 'Private SSH key',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'pem',
    caption: 'Potential cryptographic private key',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'regex',
    pattern: /^key(store|ring)$/g,
    caption: 'GNOME Keyring database file',
    level: 'high',
    description: null
  },
  {
    part: 'path',
    type: 'regex',
    pattern: /^\.?gem\/credentials$/g,
    caption: 'Rubygems credentials file',
    level: 'medium',
    description: 'Might contain API key for a rubygems.org account.'
  }
];
