'use strict'
const fs = require('fs')
const path = require('path')
const util = require('./util')
const isValidPath = require('is-valid-path')
const ConsoleWriter = require('./writers/console')
const JsonWriter = require('./writers/json')
const SumoWriter = require('./writers/sumologic')
const HttpWriter = require('./writers/http')
const logger = require('./logger')

module.exports = class RC {
  constructor () {
    this.exclude = [/^node_modules\//, /^.git\//, /package-lock.json/]
    this.failOn = 'low'
    this.modules = ['all']
    this.all = false
    this.staged = false
    this.writers = [new ConsoleWriter()]
  }

  withStaged () {
    this.staged = true
    if (this.all) {
      throw new Error('Staged flag (-g, --staged) and All flag (-a, --all) are mutually exclusive!')
    }
    return this
  }

  withAll () {
    this.all = true
    if (this.staged) {
      throw new Error('Staged flag (-g, --staged) and All flag (-a, --all) are mutually exclusive!')
    }
    return this
  }

  withModule (module) {
    if (this.modules[0] === 'all') {
      this.modules = [module]
    } else if (this.modules.indexOf(module) === -1) {
      this.modules.push(module)
    }
    return this
  }

  withExclude (exclude) {
    if (exclude.length === 0) { return this }
    this.exclude.push(new RegExp(exclude))
    logger.log('Exclusion patterns: ', exclude)
    return this
  }

  withTarget (target) {
    if (!target) {
      throw new Error('No target specified')
    }
    if (!fs.existsSync(target)) {
      throw new Error('Unable to infer the target directory. Please run with the --target flag.')
    }
    if (!isValidPath(target)) {
      throw new Error(target + ' is not a valid path')
    }

    this.target = path.resolve(target)
    this.checkRc()
    return this
  }

  checkRc () {
    const rcFile = path.join(this.target, '.hawkeyerc')
    const rcExclude = path.join(this.target, '.hawkeyeignore')
    if (fs.existsSync(rcFile)) {
      logger.log('.hawkeyerc detected in project root')
      this.parseRc(rcFile)
    }

    if (fs.existsSync(rcExclude)) {
      logger.log('.hawkeyeignore detected in project root')
      this.parseRcExclude(rcExclude)
    }
  }

  parseRc (rcFile) {
    const hawkeyerc = JSON.parse(util.readFileSync(rcFile))
    const handlers = {
      modules: modules => {
        modules.forEach(this.withModule.bind(this))
      },
      sumo: this.withSumo.bind(this),
      http: this.withHttp.bind(this),
      json: this.withJson.bind(this),
      failOn: this.withFailOn.bind(this)
    }
    Object.keys(hawkeyerc).forEach(key => {
      const handler = handlers[key]
      if (util.isEmpty(handler)) {
        throw new Error('Unknown hawkeyerc option: ' + key)
      }
      handler(hawkeyerc[key])
    })
  }

  parseRcExclude (rcExclude) {
    const hawkeyeignore = util.readFileSync(rcExclude).split('\n')
    hawkeyeignore.forEach(i => this.withExclude(i))
  }

  withThreshold (level) {
    if (['low', 'medium', 'high', 'critical'].indexOf(level) === -1) {
      throw new Error(`${level} is not an valid fail level`)
    }
    this.threshold = level
    return this
  }

  withFailOn (level) {
    if (['low', 'medium', 'high', 'critical'].indexOf(level) === -1) {
      throw new Error(`${level} is not an valid fail level`)
    }
    this.failOn = level
    return this
  }

  withJson (path) {
    if (!isValidPath(path)) {
      throw new Error(path + ' is not a valid path')
    }
    this.json = path
    this.writers.push(new JsonWriter({ path: this.json }))
    return this
  }

  withSumo (url) {
    isValidUrl(url)
    this.sumo = url
    this.writers.push(new SumoWriter({ url }))
    return this
  }

  withHttp (url) {
    isValidUrl(url)
    this.http = url
    this.writers.push(new HttpWriter({ url: this.http }))
    return this
  }
}

const isValidUrl = (userInput) => {
  var urlregex = /^(https?):\/\/.*$/
  if (!urlregex.test(userInput)) {
    throw new Error('Invalid URL: ' + userInput)
  }
}
