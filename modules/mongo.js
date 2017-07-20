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

  Log.info('Connect to MongoDB at : ', {
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
      setMongoUri()

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
  search: queryObj => {
    Log.info('Search based on queryObj : ', queryObj)
    let searchResults
    const searchP = new Promise((resolve, reject) => {
      this.db.collection(process.env.MONGO_COLLECTION)
        .find(queryObj)
        .toArray((err, result) => {
          if (err) {
            Log.error(err)
            reject(err)
          } else if (result.length) {
            searchResults = result
            searchResults.none = false
            // Log.info('Found : ', searchResults)
          } else {
            Log.info('No document(s) found with defined "find" criteria!')
            searchResults = { none: true }
          }
          resolve(searchResults)
        })
    })
    return searchP
  }
}


// Export Singleton Service
module.exports = Mongo
