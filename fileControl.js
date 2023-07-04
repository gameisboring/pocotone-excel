const { dateFormat, hoursAgo } = require('./time')
const fs = require('fs')
var path = require('path')

function makeListFile() {
  try {
    fs.readFileSync('./list' + `/${dateFormat(new Date())}_list.json`)
  } catch {
    fs.writeFileSync('./list' + `/${dateFormat(new Date())}_list.json`, '[]')
  }
}

function getNewestList(keyWord) {
  let files = fs.readdirSync(path.join('list'), 'utf-8')
  files = files
    .filter((file) => file.includes(keyWord))
    .map((file) => ({
      file,
      mtime: fs.lstatSync(path.join('list', file)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

  return files[0].file
}

module.exports = { makeListFile, getNewestList }
