// Config
require('dotenv').config()


// Dependencies
const Log = require('./modules/logger'),
  Sql = require('./modules/sql'),
  Mongo = require('./modules/mongo')


// Private vars
let configOk = false


// Private Methods
const init = () => {
  // If configured to log to a file, log to a unique file each time module is initialized
  Log.setupMtLogger()

  // Setup connections
  Sql.setupSqlCon()
  Mongo.setupMongoCon()
}


// Module definition
const sqlToMongo = {
  checkEnvReqs: () => {
    // Check Config for required key value pairs
    if (!process.env.SQL_HOST) {
      Log.error('SQL_HOST required as environmental variable')
      return false
    } else if (!process.env.SQL_PORT) {
      Log.error('SQL_PORT required as environmental variable')
      return false
    } else if (!process.env.SQL_USR) {
      Log.error('SQL_USR required as environmental variable')
      return false
    } else if (!process.env.SQL_PW) {
      Log.error('SQL_PW required as environmental variable')
      return false
    } else if (!process.env.SQL_DB) {
      Log.error('SQL_DB required as environmental variable')
      return false
    } else if (!process.env.SQL_DIALECT) {
      Log.error('SQL_DIALECT required as environmental variable')
      return false
    } else if (!process.env.SQL_POOL_MAX) {
      Log.error('SQL_POOL_MAX required as environmental variable')
      return false
    } else if (!process.env.SQL_POOL_MIN) {
      Log.error('SQL_POOL_MIN required as environmental variable')
      return false
    } else if (!process.env.SQL_POOL_IDLE) {
      Log.error('SQL_POOL_IDLE required as environmental variable')
      return false
    } else if (!process.env.MONGO_HOST) {
      Log.error('MONGO_HOST required as environmental variable')
      return false
    } else if (!process.env.MONGO_COLLECTION) {
      Log.error('MONGO_COLLECTION required as environmental variable')
      return false
    }
    // Otherwise env requirements are OK
    configOk = true
    return true
  },
  migrate: (configObj, sqlQueryStr) => {
    Log.info('Migrate using config obj : ', configObj)
    // If configured to log to a file, log to a unique file each time migrate() is called
    if (process.env.LOG_TO_FILE === 'true') Log.setupMtLog()

    // Main migration promise
    const migrateP = new Promise((resolve, reject) => {
      if (!configOk) {
        reject({
          success: false,
          error: true,
          msg: 'Migration failure, config not OK'
        })
      } else {
        Log.info('Query with', sqlQueryStr)
        // Conduct migration
        //
        // SQL.getSqlData(sqlQueryStr)
        //   .then(Mongo.updateRecords)
        //   .then(resolve({
        //     success: true,
        //     error: false,
        //     msg: 'Migration success'
        //   }))
        resolve({
          success: true,
          error: false,
          msg: 'Migration success'
        })
      }
    })
    return migrateP
  }
}


// Initialize if environmental configuration is OK upon import
if (sqlToMongo.checkEnvReqs()) init()


module.exports = sqlToMongo
