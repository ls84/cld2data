const process = require('process')
const path = require('path')
const fs = require('fs')
const rundownPDFParser = require('./rundownPDFParser.js')
let argv = require('minimist')(process.argv.slice(2))
let pdfFilePath = path.resolve(process.cwd(), argv._[0])
let writeFolderPath = path.resolve(process.cwd(), argv._[1])
let writeFilePath = `${writeFolderPath}/${pdfFilePath.split('/').pop().split('.')[0]}.json`

process.stdout.write(`converting from ${pdfFilePath} to ${writeFilePath}`)
rundownPDFParser(pdfFilePath)
.then((json) => {
  fs.writeFileSync(writeFilePath, JSON.stringify(json, null, 2))
  console.log(' done')
})
.catch((error) => {
  console.log(error)
})

// NOTE: batch processing
// ls | xargs -I {} node ../../src/cli ./{} ../data
