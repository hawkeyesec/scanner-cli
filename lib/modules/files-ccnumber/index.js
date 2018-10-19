'use strict'

/* eslint-disable no-cond-assign */

const path = require('path')
const ModuleResults = require('../../results')
const patterns = require('./data')

const MAX_FILE_LENGTH = 400

const key = __dirname.split(path.sep).pop()
module.exports = {
  key,
  description: 'Scans for suspicious file contents that are likely to contain credit card numbers',
  enabled: true,
  handles: async () => true,
  run: async fm => fm.languageFiles
    .map(file => ({ file, content: fm.readFileSync(file) }))
    .map(({ file, content }) => patterns.map(pattern => checkFileWithPattern(pattern, file, content)))
    .reduce((flatmap, next) => flatmap.concat(next), [])
    .filter(result => !!result) // filter empty results
    .reduce((results, res) => results.high(res), new ModuleResults(key))
}

const checkFileWithPattern = ({ code, description, regex }, file, content) => {
  if (content.length > MAX_FILE_LENGTH) return

  const strippedContent = content
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\D)(\d{15,})/g, '$1 $2')
    .replace(/(\d{15,})(\D)/g, '$1 $2')

  const match = regex.exec(strippedContent)
  if (!match) return
  if (!luhn(match[0])) return

  const line = content.split(match[0])[0].split('\n').length
  return { code: `${file}-${code}`, offender: file, description, mitigation: 'Check line number: ' + line }
}

/**
 * Basic check whether a credit card number is valid.
 *
 * @see https://en.wikipedia.org/wiki/Luhn_algorithm
 *
 * @param {String} ccNum Potential credit card number
 * @returns {Boolean} true if number is potentially valid credit card, otherwise false
 */
function luhn (ccNum) {
  const arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
  let len = ccNum.length
  let bit = 1
  let sum = 0

  while (len) {
    const val = parseInt(ccNum.charAt(--len), 10)
    sum += (bit ^= 1) ? arr[val] : val
  }

  return sum && sum % 10 === 0
}
