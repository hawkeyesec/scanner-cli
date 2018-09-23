'use strict'
// Kudos to ShirtlessKirk: https://gist.github.com/ShirtlessKirk/2134376

/* eslint-disable no-cond-assign */

module.exports = (function (arr) {
  function validate (ccNum) {
    var
      len = ccNum.length

    var bit = 1

    var sum = 0

    var val

    while (len) {
      val = parseInt(ccNum.charAt(--len), 10)
      sum += (bit ^= 1) ? arr[val] : val
    }

    return sum && sum % 10 === 0
  }
  return {
    validate: validate
  }
}([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]))
