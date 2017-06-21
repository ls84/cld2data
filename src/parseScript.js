var assert = require("assert");
var fs = require("fs");

function parseContent(story) {

  var r = {};

  var split = story.split("\r\n");
  //console.log(split);
  r.format = split[0].match(/\[\d\d\d\]\[播出方式\](.{0,})/)[1];
  r.title = split[1].match(/\[标题\](.{0,})/)[1];
  r.keywords = split[2].match(/\[关键字\](.{0,})/)[1];
  r.editor = split[3].match(/\[视频编辑\](.{0,})/)[1];
  r.reporter = split[4].match(/\[记者\](.{0,})/)[1];
  r.content = split.slice(5,-1).reduce(function(p,c){
    return p + "\r\n" + c
  })

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
  // console.log(raw) 
  var story = separateStory(raw)

  return story.map(function(v,i,a){
    var r = parseContent(v);
    r.order = i + 1
    return r;
  })

}

module.exports = parseScript
