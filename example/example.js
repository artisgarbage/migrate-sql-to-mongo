const fs  = require('fs'),
  // Main module file
  sqlToMongo = require('../src/index.js'),
  // Column mapping config object and SQL query statement
  mapConfigObj = require('../config/map.config.json'),
  sqlQueryStr = fs.readFileSync('./config/query.sql').toString()

// Main module method invocation
sqlToMongo.migrate(mapConfigObj, sqlQueryStr)
  .then(res => {
    console.log('Migration Success : ', res.msg)
  })
  .catch(err => {
    console.error('Migration Failure : ', err.errorMsg)
  })

// Utility method invocation checking environmental requirements
// Note, migrate() calls this method before proceeding through routine
console.log('Requirements Satisfied : ', sqlToMongo.checkEnvReqs())
