'use strict'
// Credit to https://gist.github.com/ppseprus/afab8500dec6394c401734cb6922d220

// Measure the entropy of a string in bits per symbol.
module.exports = str => getFrequencies(str)
  .reduce((sum, frequency) => {
    let p = frequency / str.length
    return sum - (p * Math.log(p) / Math.log(2))
  }, 0)

// Create an array of character frequencies.
const getFrequencies = str => {
  let dict = new Set(str)
  return [...dict].map(c => str.split(c).length - 1)
}
