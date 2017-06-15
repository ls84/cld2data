var lint = require('mocha-eslint')
var options = {
  formatter: 'compact',
  alwaysWarn: false,
  timeout: 5000,
  slow: 1000,
  strict: true
}
let path = [
  'src/parseRundownPDF.js'
]
lint(path, {formatter: 'compact'})

const assert = require('assert')
describe('parseRundownPDF', () => {
  const parseRundownPDF = require('../src/parseRundownPDF.js')
  const path = require('path')
  describe('basic information', () => {
    let output

    before(() => {
      let absoluteFilePath = path.resolve(__dirname, './cld/basis.pdf')
      return parseRundownPDF(path.resolve(absoluteFilePath))
      .then((result) => {
        output = result
      })
      .catch((error) => {
        throw new Error(error)
      })
    })
    it('should parse out 3 fields', () => {
      for (let key in output) {
        if (key !== 'meta') {
          assert(output[key].format)
          assert(output[key].text)
          assert(output[key].time)
        }
      }
    })
    it('should parse time to a 5 element array', () => {
      for (let key in output) {
        if (key !== 'meta') {
          assert.equal(output[key].time.length, 5)
        }
      }
    })
    it('should add meta information', () => {
      assert.equal(output.meta.count, 16)
      assert.equal(output.meta.program, 'CCTV-NEWS CGTN Evening News 00:00 The World Today')
      assert.equal(output.meta.date, '2017-05-17 00:00:00')
    })
  })
})
