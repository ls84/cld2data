#!/usr/local/bin/node

const process = require('process')
const path = require('path')
const fs = require('fs')
const parseRundownPDF = require('./parseRundownPDF.js')
const cleanRundownWithDuration = require('./cleanRundownWithDuration.js')
const parseScript = require('./parseScript.js')
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
      let tsv = ['fileName', 'program', 'index', 'format', 'text', 'startTime', 'endTime', 'duration'].join('\t') + '\n'
      for (let key in cleanedJSON) {
        if (key !== 'meta') {
          let row = cleanedJSON[key]
          let data = [
            path.basename(jsonFilePath).split('.')[0],
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
    break
    case 'attachScriptContent':
      let rundownPDFPath = path.resolve(process.cwd(), argv._[1])
      let cldFolder = path.dirname(rundownPDFPath)
      parseRundownPDF(rundownPDFPath)
      .then((json) => {
        let date = new Date(json.meta.date)
        let hourString = '0' + date.getHours()
        let minuteString = '0' + date.getMinutes()
        let fileName = hourString.substr(-2) + minuteString.substr(-2)
        let scriptContent = parseScript(cldFolder +  '/' + fileName + '.txt')
        for (let key in json) {
          if (key !== 'meta') {
            let script = scriptContent.filter((v) => key === v.order.toString())[0]
            json[key].editor = script.editor
            json[key].reporter = script.reporter
            json[key].keywords = script.keywords
            json[key].content = script.content
          }
        }
        process.stdout.write(JSON.stringify(json, null, 2))
      })
      .catch((error) => {
        console.log(error)
        throw new Error(`error on parsing ${pdfFilePath}`)
      })
      break
}

// NOTE: xargs must be stopped on throw
// xargs -I {} sh -c 'cld2data procedure {} $0 || exit 255'
