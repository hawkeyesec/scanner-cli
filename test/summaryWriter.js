'use strict';
let SummaryWriter = require('../lib/summaryWriter');
describe('Summary Writer', () => {
  let sample, writer;
  before(() => {
    sample = require('./samples/results.json');
    writer = new SummaryWriter();
  });

  it.skip('should write', () => {
    writer.write(sample);
  });
});
