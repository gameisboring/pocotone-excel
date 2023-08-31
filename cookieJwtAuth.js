const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.cookieJwtAuth = (req, res, next) => {
  const { token } = req.cookies
  try {
    const user = jwt.verify(token, process.env.MY_SECRET) // 검증
    req.user = user
    next()
  } catch (error) {
    // 유효시간이 초과된 경우
    if (error.name === 'TokenExpiredError') {
      return res.status(419).json({
        code: 419,
        message: '토큰이 만료되었습니다.',
      })
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === 'JsonWebTokenError') {
      /* return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.',
      }) */
      return res.redirect('/')
    }
  }
}
