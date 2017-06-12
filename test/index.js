var lint = require('mocha-eslint')
var options = {
  formatter: 'compact',
  alwaysWarn: false,
  timeout: 5000,
  slow: 1000,
  strict: true
}
let path = [
  'src/rundownPDFParser.js'
]
// lint(path, options)
lint(path, {formatter: 'compact'})

const assert = require('assert')
describe('rundownPDFParser', () => {
  const rundownPDFParser = require('../src/rundownPDFParser.js')
  const path = require('path')
  describe('basic information', () => {
    let output

    before(() => {
      let absoluteFilePath = path.resolve(__dirname, './cld/basis.pdf')
      return rundownPDFParser(path.resolve(absoluteFilePath))
      .then((output) => {
        output = output
      })
      .catch((error) => {
        throw new Error(error)
      })
    })

    it('should parse out 3 fields', () => {
      for (let key in output) {
        assert(output[key].format)
        assert(output[key].text)
        assert(output[key].time)
      }
    })
    it('should parse time to a 5 element array', () => {
      for (let key in output) {
        assert.equal(output[key].time.length, 5)
      }
    })
  })
})
