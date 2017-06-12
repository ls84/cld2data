#!/usr/local/bin/node

const process = require('process')
const path = require('path')
const fs = require('fs')
const rundownPDFParser = require('./rundownPDFParser.js')
let argv = require('minimist')(process.argv.slice(2))
let pdfFilePath = path.resolve(process.cwd(), argv._[0])
let writeFolderPath = path.resolve(process.cwd(), argv._[1])
let writeFilePath = `${writeFolderPath}/${pdfFilePath.split('/').pop().split('.')[0]}.json`

//TODO: windows file path uses \ instead, regex will not match
let datetime = /(\d\d)\/(\d\d\d\d)\.pdf/.exec(pdfFilePath)
process.stdout.write(`${datetime[1]},${datetime[2]}`)
rundownPDFParser(pdfFilePath)
.then((json) => {
  fs.writeFileSync(writeFilePath, JSON.stringify(json, null, 2))
  console.log(`,${json.meta},done`)
})
.catch((error) => {
  console.log(error)
})

// NOTE: batch processing
// ls | xargs -I {} cld2data {} /output/folder
