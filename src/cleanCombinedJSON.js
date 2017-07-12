const fs = require('fs')
const path = require('path')

module.exports = function cleanCombinedJSON (absoluteFilePath) {
  let fileName = path.basename(absoluteFilePath)
  let json = JSON.parse(fs.readFileSync(absoluteFilePath, {encoding:'utf8'}))
  let timestamp = new Date(json.meta.date).getTime()

  let cleanedJSON = {
    meta: json.meta
  }
  
  let deleteDecision = json.meta.deleteDecision
  deleteDecision.forEach((v) => {
    delete json[v]
  })

  for (let key in json) {
    if (key !== 'meta') {
      let duration = json[key].time[3]

      if (!/00:00:00/.test(duration)) {
        let time = /(\d\d):(\d\d):(\d\d)/.exec(duration)
        if (parseInt(time[1]) > 0) throw new Error(`file: ${fileName} index: ${key} - should not have passed one hour`)
        let startTime = new Date(timestamp)
        let durationInMilliseconds = ( parseInt(time[2]) * 60 + parseInt(time[3]) ) * 1000
        timestamp += durationInMilliseconds
        let endTime = new Date(timestamp)

        cleanedJSON[key] = {}
        cleanedJSON[key]['format'] = json[key].format
        cleanedJSON[key]['text'] = json[key].text
        cleanedJSON[key]['editor'] = json[key].editor
        cleanedJSON[key]['reporter'] = json[key].reporter
        cleanedJSON[key]['keywords'] = json[key].keywords
        cleanedJSON[key]['raw'] = json[key].raw
        cleanedJSON[key]['content'] = json[key].content
        cleanedJSON[key]['uniqueGuests'] = json[key].uniqueGuests
        cleanedJSON[key]['time'] = json[key].time
        cleanedJSON[key]['startTime'] = startTime
        cleanedJSON[key]['endTime'] = endTime
        cleanedJSON[key]['duration'] = durationInMilliseconds
      }
    }
  }

  return cleanedJSON
}
