'use strict';
xdescribe('Summary Writer', () => {
  let sample, writer;
  before(() => {
    let SummaryWriter = require('../../lib/writers/summary');
    sample = require('../samples/results.json');
    writer = new SummaryWriter();
  });

  it.skip('should write', () => {
    writer.write(sample);
  });
});
