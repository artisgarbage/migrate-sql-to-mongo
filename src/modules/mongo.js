/* jshint ignore:start*/

// Dependencies
const MongoClient = require('mongodb').MongoClient,
  Log = require('../utils/logger')


// Private vars
let mongoUri = 'mongodb://',
  mapConfig = {},
  db = {},
  collection = {},
  sqlResObj = {}


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


const evalTemplate = (templateStr, templateVal) => {
  let compiledTemplate = ''
  /*eslint-disable */
  const template = new Function('return `' + templateStr + '`')
  compiledTemplate = template.call({
    sqlCol: templateVal
  })
  /*eslint-enable */
  return compiledTemplate
}


const getTranslatedObj = (sqlObj) => {
  const translatedObj = {},
    oKeys = Object.keys(mapConfig)

  for (let j = oKeys.length - 1; j >= 0; j -= 1) {
    const key = oKeys[j],
      isOuterTemplate = Object.keys(mapConfig[key]).includes('templateLiteral')

    // Handle translations that require custom templatization
    if (isOuterTemplate) {
      const targetSqlCol = mapConfig[key].sqlCol
      let compiledTemplate = ''

      compiledTemplate = evalTemplate(mapConfig[key].templateLiteral, sqlObj[targetSqlCol])
      translatedObj[key] = compiledTemplate
    }

    // Handle child keys if detected, otherwise just handle the key|value pair
    if (Object.keys(mapConfig[key]).length > 1 && key !== 'sqlCol' && !isOuterTemplate) {
      // Stub inthe new key as an object
      translatedObj[key] = {}

      // Loop through child keys and populate into the transated obj
      const iKeys = Object.keys(mapConfig[key])
      for (let k = iKeys.length - 1; k >= 0; k -= 1) {
        const iKey = iKeys[k],
          targetSqlCol = mapConfig[key][iKey].sqlCol,
          isInnerTemplate = Object.keys(mapConfig[key][iKey]).includes('templateLiteral')

        if (isInnerTemplate) {
          const templateLiteral = mapConfig[key][iKey].templateLiteral
          let compiledTemplate = ''

          compiledTemplate = evalTemplate(templateLiteral, sqlObj[targetSqlCol])
          translatedObj[key][iKey] = compiledTemplate
        } else {
          translatedObj[key][iKey] = sqlObj[targetSqlCol]
        }
      }
    } else if (Object.keys(mapConfig[key]).length >= 1 && !isOuterTemplate) {
      // Push the appropriate value from sequel into the appropriate key of translated obj
      translatedObj[key] = sqlObj[mapConfig[key].sqlCol]
    }
  }
  return translatedObj
}


const translateAndSaveData = () => {
  const updatePromises = []

  // Create a promise for every record update attempt and store in an array
  for (let i = sqlResObj.data.length - 1; i >= 0; i -= 1) {
  // for (let i = 2; i >= 0; i -= 1) {
    /* eslint-disable */

    const updateP = new Promise((resolve, reject) => { // eshint-ignore-line

      let response = {}
      const record = getTranslatedObj(sqlResObj.data[i]) // eshint-ignore-line no-loop-func
      /* eslint-enable */
      collection.insertOne(record)
        .then(() => {
          response = {
            msg: 'Insert completed successfully'
          }
          resolve()
        })
        .catch((err) => {
          response = {
            errorMsg: err,
            msg: 'Insert failed to complete update'
          }
          Log.error(response.msg, err)
          reject()
        })
    })
    updatePromises.push(updateP)
  }

  // Resolve main promise once all promises in the array have completed
  return Promise.all(updatePromises)
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
          Log.error('Mongo connection error : ', err)
          reject(err)
        } else {
          db = database
          collection = db.collection(process.env.MONGO_DB_NAME)
          Log.info('Mongo connection success')
          resolve()
        }
      })
    })
    return connectP
  },
  setConfigObj: (configObj) => {
    mapConfig = configObj
    Log.debug('Map Config Set : ', mapConfig)
  },
  replaceCollection: (sqlObj) => {
    sqlResObj = sqlObj
    Log.debug(`Update : ${sqlResObj.data.length} Records`)

    const updateAllP = new Promise((resolveAll, rejectAll) => {
      let response = {}

      // Empty the target collection
      collection.removeMany({})
        .catch((err) => {
          Log.error('Failed to empty collection', err)
        })

      // Perform bulk replace if Mongo structure to be analogous
      // Otherwise, translate data based on configuration and save
      if (process.env.EQUAL_STRUCTURE === 'true') {
        collection.insertMany(sqlResObj.data)
          .then(() => {
            response = {
              msg: 'All updates completed successfully'
            }
            Log.info(response.msg)
            resolveAll(response)
          })
          .catch((err) => {
            response = {
              errorMsg: err,
              msg: 'Failed to complete all updates'
            }
            Log.error(response.msg, err)
            // Bubble a rejection to the main sqlToMongo.migrate() method where this is called
            if (process.env.SINGLE_FAIL_CAUSE_MAIN_FAIL === 'true') rejectAll(response)
          })
      } else {
        translateAndSaveData()
          .then(() => {
            response = {
              msg: `${sqlResObj.data.length} updates completed successfully`
            }
            Log.info(response.msg)
            resolveAll(response)
          })
          .catch((err) => {
            response = {
              errorMsg: err,
              msg: 'Failed to complete all updates'
            }
            Log.error(response.msg, err)
            // Bubble a rejection to the main sqlToMongo.migrate() method where this is called
            if (process.env.SINGLE_FAIL_CAUSE_MAIN_FAIL === 'true') rejectAll(response)
          })
      }
    })

    return updateAllP
  }
}


// Export Singleton Service
module.exports = Mongo

/* jshint ignore:end */
