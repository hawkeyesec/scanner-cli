'use strict'

module.exports = class ModuleResults {
  constructor (key) {
    this.key = key
    this.data = {
      high: [],
      medium: [],
      low: [],
      critical: []
    }
  }
  critical ({ code, offender, description, mitigation }) {
    this.data['critical'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
    return this
  }
  high ({ code, offender, description, mitigation }) {
    this.data['high'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
    return this
  }
  medium ({ code, offender, description, mitigation }) {
    this.data['medium'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
    return this
  }
  low ({ code, offender, description, mitigation }) {
    this.data['low'].push({ code: `${this.key}-${code}`, offender, description, mitigation })
    return this
  }
  get results () {
    return this.data
  }
}
