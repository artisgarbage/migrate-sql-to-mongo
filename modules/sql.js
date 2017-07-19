// Dependencies
const Sequelize = require('sequelize'),
  Log = require('./logger')


// Construct SQL module
const SQL = new Sequelize(process.env.SQL_DB, process.env.SQL_USR, process.env.SQL_PW, {
  host: 'localhost',
  dialect: process.env.SQL_DIALECT,
  pool: {
    max: process.env.SQL_POOL_MAX,
    min: process.env.SQL_POOL_MIN,
    idle: process.env.SQL_POOL_IDLE
  }
})


// Public method extensions
SQL.setupSqlCon = () => {
  const connP = new Promise((resolve, reject) => {
    let response = {}
    SQL.authenticate()
      .then(() => {
        response = {
          success: true,
          error: false,
          msg: 'Connection established successfully to the SQL database'
        }
        Log.info(response.msg)
        resolve(response)
      })
      .catch(err => {
        response = {
          success: false,
          error: true,
          errorMsg: err,
          msg: 'Unable to connect to the SQL database'
        }
        Log.error(response.msg, err)
        reject(response)
      })
  })
  return connP
}


module.exports = SQL
