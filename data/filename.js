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
    part: 'filename',
    type: 'regex',
    pattern: /^.*_ed25519$/,
    caption: 'Private SSH key',
    level: 'critical',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^.*_ecdsa$/g,
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
    type: 'match',
    pattern: 'ppk',
    caption: 'Potential cryptographic private key',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'regex',
    pattern: /^key(pair)?$/g,
    caption: 'Potential cryptographic private key',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'pkcs12',
    caption: 'Potential cryptographic key bundle',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'pfx',
    caption: 'Potential cryptographic key bundle',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'p12',
    caption: 'Potential cryptographic key bundle',
    level: 'critical',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'asc',
    caption: 'Potential cryptographic key bundle',
    level: 'critical',
    description: null
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'otr.private_key',
    caption: 'Pidgin OTR private key',
    level: 'critical',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?(bash_|zsh_|z)?history$/g,
    caption: 'Shell command history file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?mysql_history$/g,
    caption: 'MySQL client command history file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?psql_history$/g,
    caption: 'PostgreSQL client command history file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?irb_history$/g,
    caption: 'Ruby IRB console history file',
    level: 'high',
    description: null
  },
  {
    part: 'path',
    type: 'regex',
    pattern: /\.?purple\/accounts\.xml$/g,
    caption: 'Pidgin chat client account configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'path',
    type: 'regex',
    pattern: /\.?xchat2?\/servlist_?\.conf$/g,
    caption: 'Hexchat/XChat IRC client server list configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'path',
    type: 'regex',
    pattern: /\.?irssi\/config$/g,
    caption: 'Irssi IRC client configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'path',
    type: 'regex',
    pattern: /\.?recon-ng\/keys\.db$/g,
    caption: 'Recon-ng web reconnaissance framework API key database',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?dbeaver-data-sources.xml$/g,
    caption: 'DBeaver SQL database manager configuration file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?muttrc$/g,
    caption: 'Mutt e-mail client configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?s3cfg$/g,
    caption: 'S3cmd configuration file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?trc$/g,
    caption: 'T command-line Twitter client configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'ovpn',
    caption: 'OpenVPN client configuration file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?gitrobrc$/g,
    caption: 'Well, this is awkward... Gitrob configuration file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?(bash|zsh)rc$/g,
    caption: 'Shell configuration file',
    level: 'medium',
    description: 'Shell configuration files might contain information such as server hostnames, passwords and API keys.'
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?(bash_|zsh_)?profile$/g,
    caption: 'Shell profile configuration file',
    level: 'medium',
    description: 'Shell configuration files might contain information such as server hostnames, passwords and API keys.'
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?(bash_|zsh_)?aliases$/g,
    caption: 'Shell command alias configuration file',
    level: 'medium',
    description: 'Shell configuration files might contain information such as server hostnames, passwords and API keys.'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'secret_token.rb',
    caption: 'Ruby On Rails secret token configuration file',
    level: 'high',
    description: 'If the Rails secret token is known, it can allow for remote code execution. (http://www.exploit-db.com/exploits/27527/)'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'omniauth.rb',
    caption: 'OmniAuth configuration file',
    level: 'high',
    description: 'The OmniAuth configuration file might contain client application secrets.'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'carrierwave.rb',
    caption: 'Carrierwave configuration file',
    level: 'high',
    description: 'Can contain credentials for online storage systems such as Amazon S3 and Google Storage.'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'schema.rb',
    caption: 'Ruby On Rails database schema file',
    level: 'medium',
    description: 'Contains information on the database schema of a Ruby On Rails application.'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'database.yml',
    caption: 'Potential Ruby On Rails database configuration file',
    level: 'low',
    description: 'Might contain database credentials.'
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'settings.py',
    caption: 'Django configuration file',
    level: 'low',
    description: 'Might contain database credentials, online storage system credentials, secret keys, etc.'
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^(.*)?config(\.inc)?\.php$/g,
    caption: 'PHP configuration file',
    level: 'low',
    description: 'Might contain credentials and keys.'
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'kdb',
    caption: 'KeePass password manager database file',
    level: 'high',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'agilekeychain',
    caption: '1Password password manager database file',
    level: 'high',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'keychain',
    caption: 'Apple Keychain database file',
    level: 'high',
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
    part: 'extension',
    type: 'match',
    pattern: 'log',
    caption: 'Log file',
    level: 'low',
    description: 'Log files might contain information such as references to secret HTTP endpoints, session IDs, user information, passwords and API keys.'
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'pcap',
    caption: 'Network traffic capture file',
    level: 'low',
    description: null
  },
  {
    part: 'extension',
    type: 'regex',
    pattern: /^sql(dump)?$/g,
    caption: 'SQL dump file',
    level: 'medium',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'gnucash',
    caption: 'GnuCash database file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /backup/,
    caption: 'Contains word: backup',
    level: 'low',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /dump/,
    caption: 'Contains word: dump',
    level: 'low',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /password/,
    caption: 'Contains word: password',
    level: 'low',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /private.*key/,
    caption: 'Contains words: private, key',
    level: 'low',
    description: null
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'jenkins.plugins.publish_over_ssh.BapSshPublisherPlugin.xml',
    caption: 'Jenkins publish over SSH plugin file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'credentials.xml',
    caption: 'Potential Jenkins credentials file',
    level: 'medium',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?htpasswd$/g,
    caption: 'Apache htpasswd file',
    level: 'critical',
    description: null
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^\.?netrc$/g,
    caption: 'Configuration file for auto-login process',
    level: 'medium',
    description: 'Might contain username and password.'
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'kwallet',
    caption: 'KDE Wallet Manager database file',
    level: 'high',
    description: null
  },
  {
    part: 'filename',
    type: 'match',
    pattern: 'LocalSettings.php',
    caption: 'Potential MediaWiki configuration file',
    level: 'medium',
    description: null
  },
  {
    part: 'extension',
    type: 'match',
    pattern: 'tblk',
    caption: 'Tunnelblick VPN configuration file',
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
  },
  {
    part: 'filename',
    type: 'regex',
    pattern: /^.*\.pubxml(\.user)?$/g,
    caption: 'Potential MSBuild publish profile',
    level: 'low',
    description: null
  },
  {
    part: 'filename',
    type: 'match',
    pattern: '.env',
    caption: 'PHP dotenv',
    level: 'low',
    description: 'Environment file that contains sensitive data'
  }
];
