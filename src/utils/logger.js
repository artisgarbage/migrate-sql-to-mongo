// Dependencies
const winston = require('winston')


// Private vars
const logPriorityMap = {
  0: 'error',
  1: 'warn',
  2: 'info',
  3: 'verbose',
  4: 'debug',
  5: 'silly'
}
let timestamp = '',
  logFilepath = ''


// Winston module extension
winston.setupMtLogger = () => {
  // Set log filepath based on timestamp
  timestamp = Date.now()
  logFilepath = `./logs/log-${timestamp}.log`
  // Configure Winston logger
  winston.configure({
    level: 'verbose',
    transports: [
      new (winston.transports.Console)({
        colorize: true,
        level: logPriorityMap[process.env.LOG_PRIORITY_CONSOLE]
      }),
      new (winston.transports.File)({
        name: 'info-logfile',
        filename: logFilepath,
        level: logPriorityMap[process.env.LOG_PRIORITY_FILE]
      })
    ]
  })

  // Remove unwanted transports based on .env configuration
  if (process.env.LOG_TO_CONSOLE === 'false') winston.remove(winston.transports.Console)
  if (process.env.LOG_TO_FILE === 'false') winston.remove('info-logfile')
}


module.exports = winston
