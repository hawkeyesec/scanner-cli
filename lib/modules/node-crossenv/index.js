'use strict'

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
module.exports = {
  key: 'node-crossenv',
  name: 'Node CrossEnv malware check',
  description: 'Scans a package.json for known malicious crossenv packages',
  enabled: true,
  handles: ({ fm }) => fm.exists('package.json'),
  run: ({ fm, results }) => new Promise(function (resolve, reject) {
    const pkg = JSON.parse(fm.readFileSync('package.json'))
    const deps = Object.assign(pkg.dependencies, pkg.devDependencies, pkg.optionalDependencies, {})
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
    resolve()
  })
}
