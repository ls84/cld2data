let PDFParser = require('pdf2json')
let pdfParser = new PDFParser()

module.exports = function rundownPDFParse (absoluteFilePath) {
  return new Promise(function (resolve, reject) {
    pdfParser.on('pdfParser_dataError', errData => { reject(errData) })
    pdfParser.on('pdfParser_dataReady', pdfData => {
      let titles = {
        meta: {
          count: 0
        }
      }
      let iterator = 0

      let pages = pdfData.formImage.Pages
      pages.forEach((p) => {
        let texts = p.Texts

        texts.forEach((v) => {
          let string = decodeURIComponent(v.R[0].T)
          let program = /^(\d\d\d\d-\d\d-\d\d\s\d\d:\d\d:\d\d)(.*)$/.exec(string)
          if (program && v.y > 0.53 && v.y < 0.54) {
            titles.meta.program = program[2].trim().replace('[', '').replace(']', '')
            titles.meta.date = program[1]
          }
          if (/^\d{1,2}$/.test(string) && v.x < 6.7) {
            iterator = parseInt(string)
            titles[iterator] = {format: [], text: [], time: []}
            titles.meta.count ++
          }

          if (iterator) {
            if (v.y < 35.6 && v.y > 3.3) {
              if (v.x > 3.1 && v.x < 6.7) titles[iterator].format.push(string)
              if (v.x > 6.7 && v.x < 25.8) titles[iterator].text.push(string)
              if (v.x > 25.8) titles[iterator].time.push(string)
            }
          }
        })
      })
      if (!titles.meta.program) throw new Error(`did not parse 'program' on ${absoluteFilePath}`)
      if (!titles.meta.date) throw new Error(`did not parse 'date' on ${absoluteFilePath}`)
      if (!titles.meta.count) throw new Error(`did not iterate 'count' on ${absoluteFilePath}`)

      resolve(titles)
    })
    pdfParser.loadPDF(absoluteFilePath)
  })
}
