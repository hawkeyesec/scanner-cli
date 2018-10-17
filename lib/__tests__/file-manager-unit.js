'use strict'
/* eslint-disable no-unused-expressions */

const FileManager = require('../file-manager')
const path = require('path')
const fs = require('fs')

describe('File Manager', () => {
  let fm
  beforeEach(() => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager')
    })
  })

  afterEach(() => {
    if (fs.existsSync(`${fm.target}/test/file5`)) { fs.unlinkSync(`${fm.target}/test/file5`) }
  })

  it('should allow me to add additional exclude', () => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      exclude: [/^test\//]
    })
    const result = fm.all()
    const expected = [
      'file1.md',
      'file2'
    ]
    expect(result).to.deep.equal(expected)
  })

  it('should get the excluded files', () => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      exclude: [/^test\//]
    })

    expect(fm.excluded).to.deep.equal(['test/another-test/file4.txt', 'test/excluded/excluded-file.js', 'test/file3'])
  })

  it('should load all files in the target directory', () => {
    const result = fm.all()
    const expected = [
      'file1.md',
      'file2',
      'test/another-test/file4.txt',
      'test/excluded/excluded-file.js',
      'test/file3'
    ]
    expect(result).to.deep.equal(expected)
  })

  it('should verify file existence on files list', done => {
    expect(fm.exists('test/file3')).to.equal(true)
    done()
  })

  it('should verify existence of file on target folder if not present in files list', done => {
    fs.writeFileSync(`${fm.target}/test/file5`, '')

    expect(fm.exists('test/file5')).to.equal(true)

    done()
  })

  it('should get all files', done => {
    expect(fm.getAllFilesSync('test')).to.deep.equal([
      'test/another-test/file4.txt',
      'test/excluded/excluded-file.js',
      'test/file3'
    ])
    done()
  })
})
