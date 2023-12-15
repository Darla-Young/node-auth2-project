const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!
const { add } = require('../users/users-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

// { user_id, username, role_name } = user
function generateToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, JWT_SECRET, options)
}

// [POST] /api/auth/login { "username": "sue", "password": "1234" }
router.post("/login", checkUsernameExists, (req, res) => {
  if (bcrypt.compareSync(req.body.password, req.body.hash)) {
    const token = generateToken(req.body)

    res.json({
      message: `${req.body.username} is back!`,
      token
    })
  }

  else res.status(401).json({message: 'Invalid Credentials'})
});

// [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }
router.post("/register", validateRoleName, (req, res, next) => {
  const creds = {
    ...req.body,
    role_name: req.body.role_name.trim() || "",
    role_id: req.body.role_id || 3
  }
  const hash = bcrypt.hashSync(creds.password, 15)
  creds.password = hash

  add(creds)
    .then(user => res.status(201).json(user))
    .catch(next)
});

module.exports = router;
