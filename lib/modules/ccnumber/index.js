'use strict'

/* eslint-disable no-cond-assign */

const _ = require('lodash')
const patterns = require('./data')

const key = 'ccnumber'
module.exports = {
  key,
  name: 'Credit Card Numbers',
  description: 'Scans files for potential credit card numbers',
  enabled: true,
  handles: () => true,
  run: ({ fm, results }) => new Promise(function (resolve, reject) {
    _.flatMap(fm.languageFiles, filename => {
      const fileContent = fm.readFileSync(filename)
      return patterns.map(pattern => checkFileWithPattern(pattern, filename, fileContent))
    })
      .filter(p => !!p) // remove non-results
      .forEach(res => results.high(res))

    resolve()
  })
}

const checkFileWithPattern = ({ code, description, regex }, offender, fileContent) => {
  if (fileContent.length > 400) return

  const strippedContent = fileContent
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\d+)([ -])(\d+)/g, '$1$3')
    .replace(/(\D)(\d{15,})/g, '$1 $2')
    .replace(/(\d{15,})(\D)/g, '$1 $2')

  const match = regex.exec(strippedContent)
  if (!match) return
  if (!luhn(match[0])) return

  const line = fileContent.split(match[0])[0].split('\n').length
  return { code, offender, description, mitigation: 'Check line number: ' + line }
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
