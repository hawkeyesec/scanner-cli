'use strict'
const { spawn } = require('child_process')
const exists = require('command-exists')

const command = (command, options = {}) => new Promise(function (resolve, reject) {
  const [root, ...args] = (command instanceof Array) ? command : command.split(' ')

  let stdout = ''
  let stderr = ''

  const cwd = options.cwd
  const proc = spawn(root, args, { cwd })
  proc.stdout.on('data', data => { stdout += data })
  proc.stderr.on('data', data => { stderr += data })

  proc.on('error', err => {
    err.code = 255
    err.stdout = stdout.trim()
    err.stderr = stderr.trim()
    reject(err)
  })

  proc.on('exit', code => {
    resolve({
      code,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    })
  })
})

module.exports = {
  command,
  exists
}
