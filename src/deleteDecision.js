const fs = require('fs')
const path = require('path')
const process = require('process')
const readline = require('readline')
// const Event = require('event')

module.exports = function deleteDecision (absoluteFolderPath) {
  let json = fs.readdirSync(absoluteFolderPath)
  
  let inBetweenRE = /^(\d{1,})-(\d{1,})$/
  let singleItemRE = /^\d{1,}$/
  let fromStartRE = /^-(\d{1,})$/
  let toEndRE = /^(\d{1,})-$/

  function flatInBetween(lower, higher) {
    let flatNumbers = [parseInt(lower)]
    while (lower < higher) {
      lower ++
      flatNumbers.push(lower)
    }
    return flatNumbers
  }

  function flatFromStart (to) {
    let start = 1
    let flatNumbers = [start]
    while (start < to) {
      start ++
      flatNumbers.push(start)
    }
    return flatNumbers
  }

  function flatToEnd (from, end) {
    let flatNumbers = [parseInt(from)]
    while (from < end) {
      from ++
      flatNumbers.push(from)
    }
    return flatNumbers
  }
  
  function writeToFile (numbers, file, fileContent) {
    let filePath = `${absoluteFolderPath}/${file}`
    fileContent.meta.deleteDecision = numbers
    fileContent.meta.afterDeleteCount = fileContent.meta.count - numbers.length
    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, '\t'))
  }

  function askForDecision (file) {
    let filePath = `${absoluteFolderPath}/${file}`
    let fileContent = JSON.parse(fs.readFileSync(filePath))

    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    rl.question(`deleteDecision for ${file}\n`, (answer) => {
      let numbers = []
      let decisions = answer.split(' ')
      decisions.forEach((d) => {
        let decision
        decision = inBetweenRE.exec(d)
        if (decision) numbers = numbers.concat(flatInBetween(decision[1],decision[2]))
        decision = singleItemRE.exec(d)
        if (decision) numbers.push(parseInt(decision[0]))
        decision = fromStartRE.exec(d)
        if (decision) numbers = numbers.concat(flatFromStart(decision[1]))
        decision = toEndRE.exec(d)
        if (decision) numbers = numbers.concat(flatToEnd(decision[1], fileContent.meta.count))
      })
      writeToFile(numbers, file, fileContent)
      rl.close()
      let moreFile = json.pop()
      if (moreFile) askForDecision(moreFile)
    })
  }

  askForDecision(json.pop())
}
