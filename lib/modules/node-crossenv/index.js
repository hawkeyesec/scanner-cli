'use strict'

const ModuleResults = require('../../results')

const badPackages = [
  'babelcli',
  'cross-env.js',
  'crossenv',
  'd3.js',
  'fabric-js',
  'ffmepg',
  'gruntcli',
  'http-proxy.js',
  'jquery.js',
  'mariadb',
  'mongose',
  'mssql-node',
  'mssql.js',
  'mysqljs',
  'node-fabric',
  'node-opencv',
  'node-opensl',
  'node-openssl',
  'node-sqlite',
  'node-tkinter',
  'nodecaffe',
  'nodefabric',
  'nodeffmpeg',
  'nodemailer-js',
  'nodemailer.js',
  'nodemssql',
  'noderequest',
  'nodesass',
  'nodesqlite',
  'opencv.js',
  'openssl.js',
  'proxy.js',
  'shadowsock',
  'smb',
  'sqlite.js',
  'sqliter',
  'sqlserver',
  'tkinter'
]
const key = 'node-crossenv'
module.exports = {
  key,
  name: 'Node CrossEnv malware check',
  description: 'Scans a package.json for known malicious crossenv packages',
  enabled: true,
  handles: async fm => fm.exists('package.json'),
  run: async fm => {
    const pkg = JSON.parse(fm.readFileSync('package.json'))
    const deps = Object.assign(pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, {})
    const results = new ModuleResults(key)
    Object.keys(deps)
      .filter(dep => badPackages.indexOf(dep) >= 0)
      .forEach((dep, idx) => {
        results.critical({
          code: idx,
          offender: dep,
          description: 'node-crossenv malware found',
          mitigation: 'http://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry'
        })
      })
    return results
  }
}
