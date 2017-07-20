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


// Module Definition
const SQL = {
  isAuthd: false,
  setupSqlCon() {
    const connP = new Promise((resolve, reject) => {
      let response = {}

      Log.info('Connect to MongoDB at : ', {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USR,
        db: process.env.SQL_DB,
        dialect: process.env.SQL_DIALECT
      })

      sqlize.authenticate()
        .then(() => {
          this.isAuthd = true
          response = {
            success: true,
            error: false,
            msg: 'Sequelize connection success'
          }
          Log.info(response.msg)
          resolve(response)
        })
        .catch(err => {
          this.isAuthd = false
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
  runQuery(queryStr) {
    Log.info('Run Query : ', queryStr)
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
  },
  getSqlData(queryStr) {
    const getP = new Promise((resolve, reject) => {
      if (!this.isAuthd) {
        Log.info('Need to connect')
        this.setupSqlCon()
          .then(() => {
            this.runQuery(queryStr)
              .then(resolve)
              .catch(reject)
          })
          .catch(reject)
      } else {
        Log.info('Already connected')
        this.runQuery(queryStr)
          .then(resolve)
          .catch(reject)
      }
    })
    return getP
  }
}


module.exports = SQL
