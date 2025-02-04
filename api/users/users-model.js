const db = require('../../data/db-config.js');

async function find() {
  const users = await db('users as u')
    .join('roles as r', 'u.role_id', '=', 'r.role_id')
    .select('user_id', 'username', 'role_name')
  
  return users
}

async function findBy(table, field, value) {
  const stuff = await db(`${table}`)
  .where(`${field}`, '=', `${value}`)

  return stuff[0]
}

async function findById(user_id) {
  const userArr = await db('users as u')
  .where('user_id', '=', user_id)
  .join('roles as r', 'u.role_id', 'r.role_id')
  .select('user_id', 'username', 'role_name', 'password')

  return userArr[0]
}

/*
  {
    "user_id": 7,
    "username": "anna",
    "role_name": "team lead"
  }
*/
async function add({ username, password, role_name }) { // done for you
  let created_user_id
  await db.transaction(async trx => {
    let role_id_to_use
    const [role] = await trx('roles').where('role_name', role_name)
    if (role) {
      role_id_to_use = role.role_id
    } else {
      const [role_id] = await trx('roles').insert({ role_name: role_name })
      role_id_to_use = role_id
    }
    const [user_id] = await trx('users').insert({ username, password, role_id: role_id_to_use })
    created_user_id = user_id
  })
  return findById(created_user_id)
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};