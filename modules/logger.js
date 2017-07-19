// Dependencies
const winston = require('winston')


// Private vars
let timestamp = '',
  logFilepath = ''


// Public method extensions
winston.setupMtLogger = () => {
  // Set log filepath based on timestamp
  timestamp = Date.now()
  logFilepath = `./logs/log-${timestamp}.log`
  // Configure Winston logger
  winston.configure({
    level: 'verbose',
    transports: [
      new (winston.transports.Console)({
        colorize: true
      }),
      new (winston.transports.File)({
        name: 'info-logfile',
        filename: logFilepath
      })
    ]
  })

  // Remove unwanted transports based on .env configuration
  if (process.env.LOG_TO_CONSOLE === 'false') winston.remove(winston.transports.Console)
  if (process.env.LOG_TO_FILE === 'false') winston.remove('info-logfile')
}


module.exports = winston
