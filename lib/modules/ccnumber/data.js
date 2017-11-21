'use strict';
module.exports = [
  {
    code: 1,
    content: /(?:3[47][0-9]{13})/,
    caption: 'Potential American Express card number in file',
    level: 'high'
  },
  {
    code: 2,
    content: /(?:3(?:0[0-5]|[68][0-9])[0-9]{11})/,
    caption: 'Potential Diners Club card number in file',
    level: 'high'
  },
  {
    code: 3,
    content: /(?:6(?:011|5[0-9]{2})(?:[0-9]{12}))/,
    caption: 'Potential Discover card number in file',
    level: 'high'
  },
  {
    code: 4,
    content: /(?:(?:2131|1800|35\\d{3})\\d{11})/,
    caption: 'Potential JCB card number in file',
    level: 'high'
  },
  {
    code: 5,
    content: /(?:(?:5[0678]\\d\\d|6304|6390|67\\d\\d)\\d{8,15})/,
    caption: 'Potential Maestro card number in file',
    level: 'high'
  },
  {
    code: 6,
    content: /(?:(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12})/,
    caption: 'Potential Mastercard card number in file',
    level: 'high'
  },
  {
    code: 7,
    content: /((?:4[0-9]{12})(?:[0-9]{3})?)/,
    caption: 'Potential Visa card number in file',
    level: 'high'
  }


];
