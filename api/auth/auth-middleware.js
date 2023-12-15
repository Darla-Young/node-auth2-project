const { JWT_SECRET } = require("../secrets")
const express = require('express')
const bcrypt = require('bcryptjs')
const { findBy } = require('../users/users-model')
// const jwt = require('jsonwebtoken')
const { expressjwt: jwt} = require('express-jwt')

const restricted = (req, res, next) => {
  if (!req.body.token) res.status(401).json({message: 'Token required'})
  else {
    jwt({
      secret: JWT_SECRET, 
      algorithms: ['HS256'],
      getToken: function getFromReqBody(req) {return req.body.token},
      requestProperty: req.body,
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
  findBy(req.body.username)
    .then(user => {
      if (!user) res.status(401).json({message: "Invalid credentials"})
      else {
        req.body = {
          ...req.body,
          hash: user.password,
          role_name: user.role_name,
          user_id: user.user_id
        }
        next()
      }
    })
}


const validateRoleName = (req, res, next) => {
  /*
    If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

    If role_name is missing from req.body, or if after trimming it is just an empty string,
    set req.role_name to be 'student' and allow the request to proceed.

    If role_name is 'admin' after trimming the string:
    status 422
    {
      "message": "Role name can not be admin"
    }

    If role_name is over 32 characters after trimming the string:
    status 422
    {
      "message": "Role name can not be longer than 32 chars"
    }
  */
 next()
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
