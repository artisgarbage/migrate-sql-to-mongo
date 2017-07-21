const fs  = require('fs'),
  // Main module file
  sqlToMongo = require('./index.js'),
  // Column mapping config object and SQL query statement
  mapConfigObj = require('./map.config.json'),
  sqlQueryStr = fs.readFileSync('./query.sql').toString()

// Main module method invocation
sqlToMongo.migrate(mapConfigObj, sqlQueryStr)
  .then(res => {
    console.log('Migration Success : ', res)
  })
  .catch(err => {
    console.error('Migration Failure : ', err)
  })

// Utility method invocation checking environmental requirements
// Note, migrate() calls this method before proceeding through routine
console.log('Requirements Satisfied : ', sqlToMongo.checkEnvReqs())
