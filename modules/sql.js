// Dependencies
const Sequelize = require('sequelize'),
  Log = require('./logger')


// Private Vars
const sequelize = new Sequelize(process.env.SQL_DB, process.env.SQL_USR, process.env.SQL_PW, {
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
  Log.debug('Run Query : ', queryStr)
  // Query promise
  const queryP = new Promise((resolve, reject) => {
    let response = {}
    sequelize.query(queryStr, { type: sequelize.QueryTypes.SELECT })
      .then(res => {
        Log.debug(`Found : ${res.length} Records`)
        response = {
          success: true,
          error: false,
          msg: 'Query success',
          data: res
        }
        resolve(response)
      }).catch(err => {
        response = {
          success: false,
          error: true,
          errorMsg: err,
          msg: 'Query failure'
        }
        Log.error(response.msg, err)
        reject(response)
      })
  })
  return queryP
}


// Module Definition
const SQL = {
  isConnd: false,
  setupSqlCon() {
    const connP = new Promise((resolve, reject) => {
      Log.debug(`Connect to ${process.env.SQL_DIALECT} database at : `, {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USR,
        db: process.env.SQL_DB,
        dialect: process.env.SQL_DIALECT
      })

      let response = {}
      sequelize.authenticate()
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
        this.setupSqlCon()
          .then(() => {
            runQuery(queryStr)
              .then((res) => {
                resolve(res)
              })
              .catch((err) => {
                reject(err)
              })
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        runQuery(queryStr)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      }
    })
    return getP
  }
}


module.exports = SQL
