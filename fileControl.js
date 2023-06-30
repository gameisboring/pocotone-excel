const { dateFormat, hoursAgo } = require('./time')
const fs = require('fs')

function makeListFile() {
  try {
    fs.readFileSync('./list' + `/${dateFormat(new Date())}_list.json`)
  } catch {
    fs.writeFileSync('./list' + `/${dateFormat(new Date())}_list.json`, '[]')
  }
}

module.exports = { makeListFile }
