const fs = require('fs')
const path = require('path')
module.exports = function cleanRundownWithDuration (absoluteFilePath) {
  let fileName = path.basename(absoluteFilePath)
  let json = JSON.parse(fs.readFileSync(absoluteFilePath, {encoding:'utf8'}))
  let datetime = /(\d\d)(\d\d)/.exec(fileName)
  let hour = datetime[1]
  let minute = datetime[2]
  let timestamp = new Date(2017, 5, 17, parseInt(hour), parseInt(minute)).getTime()
  
  let cleanedJSON = {
    meta: json.meta
  }
  let signoffFlag = false
  let signoffKeywords = [/SIGN OFF/]
  for (let key in json) {
    if (key !== 'meta') {
      let duration = json[key].time[3]

      if (signoffKeywords.some((v) => v.test(json[key].text.join()))) {
        if (signoffFlag) throw new Error(`file: ${fileName} index: ${key} has duplicated SIGN OFF keywords`)
        signoffFlag = true
      }

      if (!/00:00:00/.test(duration) && !signoffFlag) {
        let time = /(\d\d):(\d\d):(\d\d)/.exec(duration)
        if (parseInt(time[1]) > 0) throw new Error(`file: ${fileName} index: ${key} - should not have passed one hour`)
        let startTime = new Date(timestamp)
        let durationInMilliseconds = ( parseInt(time[2]) * 60 + parseInt(time[3]) ) * 1000
        timestamp += durationInMilliseconds
        let endTime = new Date(timestamp)

        if (durationInMilliseconds > 600000 && !json[key].exception) {
          throw new Error(`file: ${fileName} index: ${key} - duration exceeds 10 mins`)
        }

        cleanedJSON[key] = {}
        cleanedJSON[key]['format'] = json[key].format
        cleanedJSON[key]['text'] = json[key].text
        cleanedJSON[key]['time'] = json[key].time
        cleanedJSON[key]['startTime'] = startTime
        cleanedJSON[key]['endTime'] = endTime
        cleanedJSON[key]['duration'] = durationInMilliseconds
      }
    }
  }

  if (!signoffFlag) throw new Error(`file: ${fileName} did not detect SIGN OFF keyword`)

  return cleanedJSON
}
