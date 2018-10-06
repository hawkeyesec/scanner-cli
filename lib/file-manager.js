'use strict'
const fs = require('fs')
const path = require('path')
const util = require('./util')
const Logger = require('./logger')
const Exec = require('./exec')
const languagesJson = require(path.join(__dirname, 'languages.json'))

module.exports = class FileManager {
  constructor (options) {
    this.options = util.defaultValue(options, {})
    this.options = util.permittedArgs(this.options, ['target', 'staged', 'all', 'logger', 'exclude', 'fileLimit'])
    this.options.exclude = util.defaultValue(this.options.exclude, [])
    const logger = util.defaultValue(this.options.logger, () => new Logger())
    const exec = new Exec({ logger: logger })
    logger.log('Exclusion patterns:', this.options.exclude.join(', '))
    this.options.exclude = this.options.exclude.map(e => {
      return new RegExp(e)
    })
    util.enforceArgs(this.options, ['target', 'exclude'])

    this.target = this.options.target
    this.targetRegex = new RegExp(`^${this.options.target}/?`)
    this.files = {}

    const addFile = file => {
      this.files[file] = null
    }

    const allFilesSync = dir => {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file)
        const relativePath = filePath.replace(this.targetRegex, '')

        if (fs.statSync(filePath).isDirectory()) {
          return allFilesSync(filePath)
        }
        addFile(relativePath)
      })
    }

    const gatherEncryptedFiles = dir => {
      let encrypted = []

      if (fs.existsSync(path.join(dir, '.git-crypt'))) {
        logger.log('git-crypt detected, excluding files covered by GPG encryption')
        let stdout = exec.commandSync('git-crypt status -e', {
          cwd: dir
        }).stdout
        if (stdout.length > 0) {
          encrypted = stdout.split('\n').map(f => {
            return f.split('encrypted: ').slice(-1)[0]
          })
        }
        logger.log('Files excluded by git-crypt:', encrypted.length)
      }
      return encrypted
    }

    const allFilesGit = dir => {
      let encrypted = gatherEncryptedFiles(dir)
      const command = 'git ls-tree --full-tree --name-only -r HEAD'
      return exec.commandSync(command, {
        cwd: dir
      }).stdout.trim().split('\n').filter(f => {
        return encrypted.indexOf(f) === -1
      }).forEach(addFile)
    }

    const allFilesGitStaged = dir => {
      let encrypted = gatherEncryptedFiles(dir)
      const command = 'git --no-pager diff --name-only --staged'
      return exec.commandSync(command, {
        cwd: dir
      }).stdout.trim().split('\n').filter(f => {
        return encrypted.indexOf(f) === -1
      }).forEach(addFile)
    }

    const gitRepo = path.join(this.options.target, '.git')
    if (this.options.staged === true && fs.existsSync(gitRepo)) {
      logger.log('git repo detected, using only git staged files')
      allFilesGitStaged(this.options.target)
    } else if (this.options.all === false && fs.existsSync(gitRepo)) {
      logger.log('git repo detected, will only use git tracked files')
      allFilesGit(this.options.target)
    } else {
      logger.log('scanning all files in target directory')
      allFilesSync(this.options.target)
    }

    const isExcluded = file => {
      let excluded = false
      this.options.exclude.forEach(exclusion => {
        const result = exclusion.exec(file)
        if (result !== null) {
          logger.debug(file, 'was excluded by regex', result[0])
          excluded = true
        }
      })
      return excluded
    }

    this.excluded = Object.keys(this.files).filter(file => isExcluded(file))
    this.excluded.forEach(e => { delete this.files[e] })
    logger.log('Files excluded by exclusion patterns:', Object.keys(this.excluded).length)

    const fileNames = Object.keys(this.files)
    const numberOfFiles = fileNames.length
    const fileLimit = this.options.fileLimit
    if (numberOfFiles > fileLimit) {
      logger.warn('The number of files to scan is set to limit of ' + fileLimit + ', and you have', numberOfFiles)
      logger.warn('Increase the limit if you want to scan more files')
      const top = fileNames.slice(0, fileLimit)
      fileNames.forEach(file => {
        if (top.indexOf(file) === -1) {
          delete this.files[file]
        }
      })
    }
    logger.log('Files included in scan:', Object.keys(this.files).length)

    this.languageFiles = Object.keys(this.files).filter(file => {
      const extension = '.' + file.split('.').pop()
      const supportedExtensions = languagesJson.reduce((acc, name) => name.extensions ? acc.concat(name.extensions) : acc, [])
      return supportedExtensions.indexOf(extension) > -1
    })
  }

  getAllFilesSync (dir) {
    let files = []
    const absolute = path.join(this.options.target, dir)

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
    const absolute = path.join(this.options.target, file)
    const contents = util.readFileSync(absolute)
    this.files[file] = contents
    return contents
  }

  readFile (file, done) {
    return done(null, this.readFileSync(file))
  }

  exists (file) {
    if (Object.keys(this.files).indexOf(file) > -1) { return true }
    const absolute = path.join(this.options.target, file)
    return fs.existsSync(absolute)
  }
}
