const { dateFormat, hoursAgo } = require('./time')
const fs = require('fs')
var path = require('path')
const logger = require('./logger')
function makeListFile() {
  try {
    fs.readFileSync('./list' + `/${dateFormat(new Date())}_list.json`)
  } catch {
    logger.info(`List File was Written : ${dateFormat(new Date())}_list.json`)
    fs.writeFileSync('./list' + `/${dateFormat(new Date())}_list.json`, '[]')
  }
}

function getNewestList(keyWord) {
  try {
    let files = fs.readdirSync(path.join('list'), 'utf-8')
    files = files
      .filter((file) => file.includes(keyWord))
      .map((file) => ({
        file,
        mtime: fs.lstatSync(path.join('list', file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    return files[0].file
  } catch (error) {
    logger.error(error)
    makeListFile()
  }
}

function getConfigFile() {
  if (!fs.existsSync(path.join('config', 'notiConfig.json'))) {
    logger.warn(`please write file "notiConfig.json"`)
    return false
  } else {
    let setting = JSON.parse(
      fs.readFileSync(path.join('config', 'notiConfig.json'))
    )
    return setting
  }
}

module.exports = { makeListFile, getNewestList, getConfigFile }
