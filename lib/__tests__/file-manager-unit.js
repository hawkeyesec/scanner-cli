'use strict'

const FileManager = require('../file-manager')
const path = require('path')
const should = require('should')
const deride = require('deride')
const fs = require('fs')
const os = require('os')

describe('File Manager', () => {
  let fm, nullLogger
  beforeEach(() => {
    nullLogger = deride.stub(['log', 'debug', 'error', 'warn'])
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      logger: nullLogger
    })
  })

  afterEach(() => {
    if (fs.existsSync(`${fm.target}/test/file5`)) { fs.unlinkSync(`${fm.target}/test/file5`) }
  })

  it('should allow me to add additional exclude', () => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      logger: nullLogger,
      exclude: ['^test/']
    })
    const result = fm.all()
    const expected = [
      'file1.md',
      'file2'
    ]
    should(result).eql(expected)
  })

  it('should get the excluded files', () => {
    fm = new FileManager({
      target: path.join(__dirname, 'samples/filemanager'),
      logger: nullLogger,
      exclude: ['^test/']
    })

    should(fm.excluded).eql(['test/another-test/file4.txt', 'test/excluded/excluded-file.js', 'test/file3'])
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
    should(result).eql(expected)
  })

  describe('fileLimit', () => {
    const mockTargetDir = path.join(os.tmpdir(), 'hawkeye-test-')

    let tempDir
    let tempFileNames = []

    const writeFileAsync = (tempDir) => {
      return new Promise((resolve, reject) => {
        const randomFileName = `${Math.random().toString(36).slice(2)}.js`

        tempFileNames = tempFileNames.concat(randomFileName)

        fs.writeFile(path.join(tempDir, randomFileName), '', { flag: 'w+' }, (err) => {
          if (!err) {
            resolve()
          } else {
            reject(err)
          }
        })
      })
    }

    before((done) => {
      fs.mkdtemp(mockTargetDir, (_, folder) => {
        tempDir = folder

        const files = []
        for (let i = 0; i < 20; i++) {
          files.push(writeFileAsync(tempDir))
        }

        Promise.all(files).then(() => {
          done()
        })
      })
    })

    it('should pick a subset of files based on fileLimit', (done) => {
      fm = new FileManager({
        target: tempDir,
        logger: nullLogger,
        fileLimit: 10
      })
      const result = fm.all()

      should(result.length).eql(10)
      done()
    })

    it('should scan all files when fileLimit is not set', (done) => {
      fm = new FileManager({
        target: tempDir,
        logger: nullLogger
      })
      const result = fm.all()

      should(result.length).eql(20)
      done()
    })

    after((done) => {
      for (let i = 0; i < tempFileNames.length; i++) {
        fs.unlinkSync(path.join(tempDir, tempFileNames[i]))
      }

      fs.rmdir(tempDir, () => done())
    })
  })

  it('should const me exclude extensions', () => {
    const result = fm.excludeExtensions(['txt', 'md'])
    const expected = [
      'file2',
      'test/excluded/excluded-file.js',
      'test/file3'
    ]
    should(result).eql(expected)
  })

  it('should const me select by extension', () => {
    const result = fm.byExtensions(['txt', 'md'])
    const expected = [
      'file1.md',
      'test/another-test/file4.txt'
    ]
    should(result).eql(expected)
  })

  it('should const me select by path', () => {
    const result = fm.byPaths(['test/another-test'])
    const expected = [
      'test/another-test/file4.txt'
    ]
    should(result).eql(expected)
  })

  it('should const me get a files contents', done => {
    fm.readFile('test/file3', (err, contents) => {
      should.ifError(err)
      should(contents).eql('this is file 3')
      done()
    })
  })

  it('should verify file existence on files list', done => {
    should(fm.exists('test/file3')).eql(true)
    done()
  })

  it('should verify existence of file on target folder if not present in files list', done => {
    fs.writeFileSync(`${fm.target}/test/file5`, '')

    should(fm.exists('test/file5')).eql(true)

    done()
  })

  it('should get all files', done => {
    should(fm.getAllFilesSync('test')).eql([
      'test/another-test/file4.txt',
      'test/excluded/excluded-file.js',
      'test/file3'
    ])
    done()
  })
})
