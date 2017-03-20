'use strict';
const FileManager = require('../lib/fileManager');
const path = require('path');
const should = require('should');

describe('File Manager', () => {
  let fm;
  before(() => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      globalExclusions: ['test/excluded']
    });
  });

  it('should load all files in the target directory', () => {
    let result = fm.all();

    let expected = [
      'file1.md',
      'file2',
      'test/another-test/file4.txt',
      'test/excluded/excluded-file.js',
      'test/file3'
    ];
    should(result).eql(expected);
  });

  it('should let me exclude extensions', () => {
    let result = fm.excludeExtensions(['txt', 'md']);
     let expected = [
      'file2',
      'test/excluded/excluded-file.js',
      'test/file3'
    ];
    should(result).eql(expected);
  });

  it('should let me select by extension', () => {
    let result = fm.byExtensions(['txt', 'md']);
     let expected = [
      'file1.md',
      'test/another-test/file4.txt'
    ];
    should(result).eql(expected);
  });

  it('should let me select by path', () => {
    let result = fm.byPaths(['test/another-test']);
     let expected = [
      'test/another-test/file4.txt'
    ];
    should(result).eql(expected);
  });

  it('should let me get a files contents', done => {
    fm.readFile('test/file3', (err, contents) => {
      should.ifError(err);
      should(contents).eql('this is file 3');
      done();
    });
  });
});
