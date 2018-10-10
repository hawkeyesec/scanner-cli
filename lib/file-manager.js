'use strict'
const fs = require('fs')
const path = require('path')
const util = require('./util')
const logger = require('./logger')
const exec = require('./exec')
const languagesJson = require(path.join(__dirname, 'languages.json'))
const _ = require('lodash')

module.exports = class FileManager {
  constructor ({ target, staged, all, exclude = [] }) {
    this.target = target
    this.exclude = exclude
    this.targetRegex = new RegExp(`^${this.target}/?`)
    this.files = {}

    const gitRepo = path.join(this.target, '.git')

    if (staged === true && fs.existsSync(gitRepo)) {
      logger.log('git repo detected, using only git staged files')
      this.allFilesGitStaged(this.target)
    } else if (all === false && fs.existsSync(gitRepo)) {
      logger.log('git repo detected, will only use git tracked files')
      this.allFilesGit(this.target)
    } else {
      logger.log('scanning all files in target directory')
      this.allFilesSync(this.target)
    }

    this.excluded = Object.keys(this.files)
      .filter(filename => this.exclude.reduce((accum, excl) => accum || !!excl.exec(filename), false))
    this.files = _.omit(this.files, this.excluded)
    logger.log('Files excluded by exclusion patterns:', Object.keys(this.excluded).length)

    this.languageFiles = Object.keys(this.files).filter(file => {
      const extension = '.' + file.split('.').pop()
      const supportedExtensions = languagesJson.reduce((acc, name) => name.extensions ? acc.concat(name.extensions) : acc, [])
      return supportedExtensions.indexOf(extension) > -1
    })
  }

  addFile (file) {
    this.files[file] = null
  }

  allFilesSync (dir) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file)
      const relativePath = filePath.replace(this.targetRegex, '')

      if (fs.statSync(filePath).isDirectory()) {
        return this.allFilesSync(filePath)
      }
      this.addFile(relativePath)
    })
  }

  allFilesGit (cwd) {
    exec.commandSync('git ls-tree --full-tree --name-only -r HEAD', { cwd })
      .stdout.trim()
      .split('\n')
      .forEach(f => this.addFile(f))
  }

  allFilesGitStaged (cwd) {
    exec.commandSync('git --no-pager diff --name-only --staged', { cwd })
      .stdout.trim()
      .split('\n')
      .forEach(f => this.addFile(f))
  }

  getAllFilesSync (dir) {
    let files = []
    const absolute = path.join(this.target, dir)

    fs.readdirSync(absolute).forEach(file => {
      const filePath = path.join(absolute, file)
      const relativePath = filePath.replace(this.targetRegex, '')

      if (fs.statSync(filePath).isDirectory()) {
        files = files.concat(this.getAllFilesSync(relativePath))
        return files
      }
      files = files.concat(relativePath)
    })
    return files
  }

  all () {
    return Object.keys(this.files)
  }

  readFileSync (file) {
    if (!util.isEmpty(this.files[file])) { return this.files[file] }
    const absolute = path.join(this.target, file)
    const contents = util.readFileSync(absolute)
    this.files[file] = contents
    return contents
  }

  readFile (file, done) {
    return done(null, this.readFileSync(file))
  }

  exists (file) {
    if (Object.keys(this.files).indexOf(file) > -1) { return true }
    const absolute = path.join(this.target, file)
    return fs.existsSync(absolute)
  }
}
