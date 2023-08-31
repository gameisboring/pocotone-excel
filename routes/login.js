// login.js
const jwt = require('jsonwebtoken')
require('dotenv').config()
const logger = require('../logger')

const getUser = () => {
  return {
    username: process.env.USER_NAME,
    password: process.env.USER_PASSWORD,
  }
}

const login = (app) => {
  app.post('/login', (req, res) => {
    logger.http('POST /login')
    const { username, password } = req.body
    const user = getUser()

    if (user.username !== username) {
      logger.warn(`Login info | ID: ${username} | PW: ${password}`)
      return res
        .status(401)
        .send({ ok: false, error: '아이디 혹은 비밀번호를 확인해주세요' })
    }

    if (user.password !== password) {
      logger.warn(`Login info | ID: ${username} | PW: ${password}`)
      return res
        .status(401)
        .send({ ok: false, error: '아이디 혹은 비밀번호를 확인해주세요' })
    }

    logger.info('login success')

    // ** 중요
    const token = jwt.sign(user, process.env.MY_SECRET, { expiresIn: '3y' }) // 토큰 생성

    res.cookie('token', token) // 쿠키에 토큰 설정

    return res.send({ ok: true })
  })
}

module.exports = { login }
