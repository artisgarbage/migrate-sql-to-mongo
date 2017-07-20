// Dependencies
const Sequelize = require('sequelize'),
  Log = require('./logger')


// Private Vars
const sqlize = new Sequelize(process.env.SQL_DB, process.env.SQL_USR, process.env.SQL_PW, {
  host: process.env.SQL_HOST,
  dialect: process.env.SQL_DIALECT,
  pool: {
    max: process.env.SQL_POOL_MAX,
    min: process.env.SQL_POOL_MIN,
    idle: process.env.SQL_POOL_IDLE
  },
  logging: (process.env.LOG_SQL_STATEMENTS === 'true') ? Log.info : false
})


// Private Methods
const runQuery = function runQuery(queryStr) {
  Log.info('Run Query : ', queryStr)
  // Query promise
  const queryP = new Promise((resolve, reject) => {
    resolve({
      success: true,
      error: false,
      msg: 'Query successfully',
      data: [{ name: 'name1' }, { name: 'name2' }, { name: 'name3' }]
    })
    const something = {}
    if (something === 'something else') reject()
  })
  return queryP
}


// Module Definition
const SQL = {
  isConnd: false,
  setupSqlCon() {
    const connP = new Promise((resolve, reject) => {
      Log.info('Connect to MongoDB at : ', {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USR,
        db: process.env.SQL_DB,
        dialect: process.env.SQL_DIALECT
      })

      let response = {}
      sqlize.authenticate()
        .then(() => {
          this.isConnd = true
          response = {
            success: true,
            error: false,
            msg: 'Sequelize connection success'
          }
          Log.info(response.msg)
          resolve(response)
        })
        .catch(err => {
          this.isConnd = false
          response = {
            success: false,
            error: true,
            errorMsg: err,
            msg: 'Sequelize connection failure'
          }
          Log.error(response.msg, err)
          reject(response)
        })
    })
    return connP
  },
  getSqlData(queryStr) {
    const getP = new Promise((resolve, reject) => {
      // Connect first then run query if not connected
      if (!this.isConnd) {
        Log.info('Need to connect')
        this.setupSqlCon()
          .then(() => {
            runQuery(queryStr)
              .then(resolve)
              .catch(reject)
          })
          .catch(reject)
      } else {
        Log.info('Already connected')
        runQuery(queryStr)
          .then(resolve)
          .catch(reject)
      }
    })
    return getP
  }
}


module.exports = SQL
