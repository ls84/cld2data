#!/usr/local/bin/node

const process = require('process')
const path = require('path')
const fs = require('fs')
const parseRundownPDF = require('./parseRundownPDF.js')
const cleanCombinedJSON = require('./cleanCombinedJSON.js')
const parseScript = require('./parseScript.js')
let argv = require('minimist')(process.argv.slice(2))
let procedure = argv._[0]

function padTime (number) {
}
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
  case 'cleanCombinedJSON':
    let jsonFilePath = path.resolve(process.cwd(), argv._[1])
    let cleanedJSON = cleanCombinedJSON(jsonFilePath)
    if (argv.f === 'tsv') {   
      let tsv = ['fileName', 'program', 'index', 'format', 'title', 'editor', 'reporter', 'keywords', 'content', 'startTime', 'endTime', 'duration'].join('\t') + '\n'
      for (let key in cleanedJSON) {
        if (key !== 'meta') {
          let row = cleanedJSON[key]
          let data = [
            path.basename(jsonFilePath).split('.')[0],
            cleanedJSON.meta.program,
            key,
            row.format.join(),
            row.text.join(),
            row.editor,
            row.reporter,
            row.keywords,
            JSON.stringify(row.content),
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

    if (argv.f === 'excel') {
      let tsv = ''
      for (let key in cleanedJSON) {
        if (key !== 'meta') {
          let row = cleanedJSON[key]
          let title = row.content.Topic2line ? row.content.Topic2line[0].join() : row.text.join()
          let startTime = ('0' + row.startTime.getMinutes()).substr(-2) + ('0' + row.startTime.getSeconds()).substr(-2)
          let endTime = ('0' + row.endTime.getMinutes()).substr(-2) + ('0' + row.endTime.getSeconds()).substr(-2)
          let data = [
            key,
            startTime,
            endTime,
            title,
            '',
            row.raw.join('\\n'),
            row.format
          ]
          for (let i = 0; i < 16; i ++) {
            data.push('')
          }
          let datetime = new Date(cleanedJSON.meta.date)
          let year = datetime.getFullYear()
          let month = datetime.getMonth()
          let date = datetime.getDate()
          let hours = datetime.getHours()
          data.push(year)
          data.push(('0' + (month + 1)).substr(-2))
          data.push(('0' + date).substr(-2))
          data.push(('0' + hours).substr(-2))
          tsv += data.join('\t')
          tsv += '\n'
        }
      }
      return process.stdout.write(tsv)
    }
    process.stdout.write(JSON.stringify(cleanedJSON, null, 2))
    break
  case 'parseScript':
    let txtFilePath = path.resolve(process.cwd(), argv._[1])
    let content = parseScript(txtFilePath)
    console.log(content)
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
          json[key].raw = script.raw
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
