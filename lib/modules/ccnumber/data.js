'use strict'
module.exports = [
  {
    code: 1,
    regex: /(?:3[47][0-9]{13})/,
    description: 'Potential American Express card number in file'
  },
  {
    code: 2,
    regex: /(?:3(?:0[0-5]|[68][0-9])[0-9]{11})/,
    description: 'Potential Diners Club card number in file'
  },
  {
    code: 3,
    regex: /^65[4-9][0-9]{13}|64[4-9][0-9]{13}|6011[0-9]{12}|(622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[01][0-9]|92[0-5])[0-9]{10})$/,
    description: 'Potential Discover card number in file'
  },
  {
    code: 4,
    regex: /^(?:2131|1800|35\d{3})\d{11}$/,
    description: 'Potential JCB card number in file'
  },
  {
    code: 5,
    regex: /(?:(?:5[0678]\\d\\d|6304|6390|67\\d\\d)\\d{8,15})/,
    description: 'Potential Maestro card number in file'
  },
  {
    code: 6,
    regex: /(?:(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12})/,
    description: 'Potential Mastercard card number in file'
  },
  {
    code: 7,
    regex: /((?:4[0-9]{12})(?:[0-9]{3})?)/,
    description: 'Potential Visa card number in file'
  }
]
