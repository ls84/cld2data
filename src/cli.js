#!/usr/local/bin/node

const process = require('process')
const path = require('path')
const fs = require('fs')
const parseRundownPDF = require('./parseRundownPDF.js')
const cleanRundownWithDuration = require('./cleanRundownWithDuration.js')
let argv = require('minimist')(process.argv.slice(2))
let procedure = argv._[0]

switch (procedure) {
  case 'parseRundownPDF':
    let pdfFilePath = path.resolve(process.cwd(), argv._[1])
    parseRundownPDF(pdfFilePath)
    .then((json) => {
      process.stdout.write(JSON.stringify(json, null, 2))
    })
    .catch((error) => {
      throw new Error(`error on parsing ${pdfFilePath}`)
    })
    break
  case 'cleanRundownWithDuration':
    let jsonFilePath = path.resolve(process.cwd(), argv._[1])
    let cleanedJSON = cleanRundownWithDuration(jsonFilePath)
    if (argv.f === 'tsv') {   
      let tsv = ['date', 'program', 'index', 'format', 'text', 'startTime', 'endTime', 'duration'].join('\t') + '\n'
      for (let key in cleanedJSON) {
        if (key !== 'meta') {
          let row = cleanedJSON[key]
          let data = [
            cleanedJSON.meta.date,
            cleanedJSON.meta.program,
            key,
            row.format.join(),
            row.text.join(),
            row.startTime.toISOString(),
            row.endTime.toISOString(),
            row.duration / 1000
          ]
          tsv += data.join('\t')
          tsv += '\n'
        }
      }
      return process.stdout.write(tsv)
    }
    process.stdout.write(JSON.stringify(cleanedJSON, null, 2))
}

// NOTE: xargs must be stopped on throw
// xargs -I {} sh -c 'cld2data procedure {} $0 || exit 255'
