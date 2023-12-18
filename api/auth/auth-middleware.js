const { JWT_SECRET } = require("../secrets")
const express = require('express')
const bcrypt = require('bcryptjs')
const { findBy, findById } = require('../users/users-model')
// const jwt = require('jsonwebtoken')
const { expressjwt: jwt} = require('express-jwt')

const restricted = (req, res, next) => {

  if (!req.token) res.status(401).json({message: 'Token required'})
  else {
    jwt({
      secret: JWT_SECRET, 
      algorithms: ['HS256'],
      getToken: function getFromReqBody(req) {return req.token},
      // requestProperty: req,
    }) // decoded token avail. on req.auth

    !req.auth.admin ? res.status(401).json({message: 'Token invalid'}) : next()
  }
}

const only = role_name => (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header with a role_name
    inside its payload matching the role_name passed to this function as its argument:
    status 403
    {
      "message": "This is not for you"
    }

    Pull the decoded token from the req object, to avoid verifying it again!
  */
 next()
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
