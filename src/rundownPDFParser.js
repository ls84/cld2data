let PDFParser = require('pdf2json')
let pdfParser = new PDFParser()

module.exports = function rundownPDFParser (absoluteFilePath) {
  return new Promise(function (resolve, reject) {
    pdfParser.on('pdfParser_dataError', errData => { reject(errData) })
    pdfParser.on('pdfParser_dataReady', pdfData => {
      let titles = {}
      let iterator = 0

      let pages = pdfData.formImage.Pages
      pages.forEach((p) => {
        let texts = p.Texts

        texts.forEach((v) => {
          let string = decodeURIComponent(v.R[0].T)
          if (/^\d{1,2}$/.test(string) && v.x < 6.7) {
            iterator = parseInt(string)
            titles[iterator] = {format: [], text: [], time: []}
          }

          if (iterator) {
            if (v.x > 3.1 && v.x < 6.7) titles[iterator].format.push(string)
            if (v.x > 6.7 && v.x < 25.8) titles[iterator].text.push(string)
            if (v.x > 25.8) titles[iterator].time.push(string)
          }
        })
      })
      resolve(titles)
    })
    pdfParser.loadPDF(absoluteFilePath)
  })
}
