const { JWT_SECRET } = require("../secrets")
const { findBy, findById } = require('../users/users-model')
const jwt = require('jsonwebtoken')

const restricted = (req, res, next) => {
  const token = req.headers.authorization
  
  if (!token) {
    res.status(401).json({message: 'Token required'})
  }
  else if (token.split('.').length !== 3) {
    res.status(401).json({message: 'Token invalid'})
  }
  else {
    req.decoded = jwt.verify(token, JWT_SECRET)
    next()
  }
}

const only = role_name => (req, res, next) => {
  const role = req.decoded.role_name
  if (role !== role_name) res.status(403).json({message: "This is not for you"})
  else next()
}

const checkUsernameExists = (req, res, next) => {
  findBy('users', 'username', req.body.username)
  .then(user => {
    if (!user) res.status(401).json({message: "Invalid credentials"})
    else {
      findById(user.user_id)
      .then(u => {
        req.body = {
          ...req.body,
          hash: u.password,
          role_name: u.role_name,
          user_id: u.user_id
        }
        next()
      })
    }
  })
}

const validateRoleName = (req, res, next) => {
  const role = req.body.role_name
  if (!role) {
    req.role_name = 'student'
    next()
  }
  else if (role.trim() === 'admin') {
    res.status(422).json({message: "Role name can not be admin"})
  }
  else if (role.trim().length > 32) {
    res.status(422).json({message: "Role name can not be longer than 32 chars"})
  }
  else {
    req.role_name = role.trim()
    next()
  }
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}