// Dependencies
const MongoClient = require('mongodb').MongoClient,
  Log = require('./logger')


// Private vars
let mongoUri = 'mongodb://'


// Private Methods
const setMongoUri = () => {
  if (process.env.MONGO_USR && process.env.MONGO_PW) {
    mongoUri = `${process.env.MONGO_USR}:${process.env.MONGO_PW}@`
  }
  if (process.env.MONGO_HOST) mongoUri = `${mongoUri}${process.env.MONGO_HOST}`
  if (process.env.MONGO_PORT) mongoUri = `${mongoUri}:${process.env.MONGO_PORT}`
  if (process.env.MONGO_DB_NAME) mongoUri = `${mongoUri}/${process.env.MONGO_DB_NAME}`

  Log.debug('Connect to MongoDB at : ', {
    host: process.env.MONGO_HOST,
    user: process.env.MONGO_USR,
    db: process.env.MONGO_DB_NAME,
    collection: process.env.MONGO_COLLECTION
  })
}


// Module definition
const Mongo = {
  db: {},
  setupMongoCon: () => {
    const connectP = new Promise((resolve, reject) => {
      // Set connection URI
      setMongoUri()
      // Attempt connection
      MongoClient.connect(mongoUri, {
        uri_decode_auth: true, // jshint ignore:line
        poolSize: process.env.MONGO_POOL_SIZE
      }, (err, database) => {
        if (err) {
          Log.error('Mongo Connection Error : ', err)
          reject(err)
        } else {
          this.db = database
          Log.info('Mongo Connection Success')
          resolve()
        }
      })
    })
    return connectP
  },
  updateRecords: sqlResObj => {
    Log.debug(`Update : ${sqlResObj.data.length} Records`)

    const updateAllP = new Promise((resolveAll, rejectAll) => {
      const updatePromises = []
      let response = {}

      // Create a promise for every record update attempt and store in an array
      for (let i = sqlResObj.data.length - 1; i >= 0; i -= 1) {
        const updateP = new Promise((resolve, reject) => { // jshint ignore:line
          if (sqlResObj.data[i]) resolve()
          else reject()
        })
        updatePromises.push(updateP)
      }

      // Resolve main promise once all promises in the array have completed
      Promise.all(updatePromises)
        .then(() => {
          response = {
            success: true,
            error: false,
            msg: 'All updates completed successfully'
          }
          Log.info(response.msg)
          resolveAll(response)
        })
        .catch((err) => {
          response = {
            success: false,
            error: true,
            errorMsg: err,
            msg: 'Failed to complete all updates'
          }
          Log.error(response.msg, err)
          // Bubble a rejection to the main sqlToMongo.migrate() method where this is called
          if (process.env.SINGLE_FAIL_CAUSE_MAIN_FAIL === 'true') rejectAll(response)
        })
    })
    return updateAllP
  }
}


// Export Singleton Service
module.exports = Mongo
