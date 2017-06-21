var assert = require("assert");
var fs = require("fs");

function parseContent(story) {

  var r = {};

  var split = story.split("\r\n");
  r.format = split[0].match(/\[\d\d\d\]\[播出方式\](.{0,})/)[1];
  r.title = split[1].match(/\[标题\](.{0,})/)[1];
  r.keywords = split[2].match(/\[关键字\](.{0,})/)[1];
  r.editor = split[3].match(/\[视频编辑\](.{0,})/)[1];
  r.reporter = split[4].match(/\[记者\](.{0,})/)[1];
  
  let tagFlag = 'text'
  let parsedContent = {
    text: []
  }
  let tagstart
  split.forEach((v, i) => {
    if (i > 5) {
      tagstart = /【(.{1,})】/.exec(v)
      if (tagstart) {
        tagFlag = tagstart[1]
        parsedContent[tagFlag] = []
      }
      parsedContent[tagFlag].push(v)
      tagstart = null
    }
  })
  for (let key in parsedContent) {
    parsedContent[key] = parsedContent[key].filter((v) => v.trim() !== '')
    if (key !== 'text') {
      parsedContent[key].splice(0, 1)
    }
  }
  r.content = parsedContent

  return r

}

function separateStory(raw) {
  var match = raw.match(/(\[\d\d\d\])/g);

  var index = match.map(function(v){
    return raw.indexOf(v);
  })
  index.push(raw.length);

  var story = index.map(function(v,i,a){
    if (a[i+1]) {
      return raw.slice(a[i],a[i+1])
    }
  })
  story.pop();

  return story
}

var parseScript = function (absoluteFilePath) {
  
  let raw = fs.readFileSync(absoluteFilePath, {encoding:'utf8'})
  var story = separateStory(raw)

  return story.map(function(v,i,a){
    var r = parseContent(v);
    r.order = i + 1
    return r;
  })

}

module.exports = parseScript
