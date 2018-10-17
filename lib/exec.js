'use strict'

const { spawn, spawnSync } = require('child_process')
const commandExists = require('command-exists')

const command = (command, options = {}) => new Promise(function (resolve, reject) {
  const [root, ...args] = (command instanceof Array) ? command : command.split(' ')

  let stdout = ''
  let stderr = ''

  const cwd = options.cwd
  const proc = spawn(root, args, { cwd })
  proc.stdout.on('data', data => { stdout += data.toString() })
  proc.stderr.on('data', data => { stderr += data.toString() })

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

const commandSync = (command, options = {}) => {
  const [root, ...args] = (command instanceof Array) ? command : command.split(' ')

  const cwd = options.cwd
  let { error, stdout, stderr, status: code } = spawnSync(root, args, { cwd })
  stdout = (stdout || '').toString().trim()
  stderr = (stderr || '').toString().trim()

  if (error) {
    error.code = 255
    error.stdout = stdout
    error.stderr = stderr
    throw error
  }
  return { code, stdout, stderr }
}

const exists = async cmd => {
  let hasCommand
  try {
    await commandExists(cmd)
    hasCommand = true
  } catch (e) {
    hasCommand = false
  }
  return hasCommand
}

module.exports = {
  command,
  commandSync,
  exists
}
