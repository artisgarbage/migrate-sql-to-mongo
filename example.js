const fs  = require('fs'),
  // Main module file
  sqlToMongo = require('./index.js'),
  // Column mapping config object and SQL query statement
  mapConfigObj = require('./example.map.config.json'),
  sqlQueryStr = fs.readFileSync('./example.query.txt').toString()

// Main module method invocation
sqlToMongo.migrate(mapConfigObj, sqlQueryStr)
  .then(res => {
    console.log('Migration Success : ', res)
  })
  .catch(err => {
    console.error('Migration Failure : ', err)
  })
