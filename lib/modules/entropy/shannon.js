'use strict';
// Credit to https://gist.github.com/ppseprus/afab8500dec6394c401734cb6922d220
module.exports = function Shannon() {
  // Create an array of character frequencies.
  const getFrequencies = str => {
    let dict = new Set(str);
    return [...dict].map(c=>str.split(c).length-1);
  };

  let self = {};
  // Measure the entropy of a string in bits per symbol.
  self.entropy = str => getFrequencies(str)
  .reduce((sum, frequency) => {
    let p = frequency / str.length;
    return sum - (p * Math.log(p) / Math.log(2));
  }, 0);

  return Object.freeze(self);
};
