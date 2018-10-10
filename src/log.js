var winston = require('winston');
require('winston-daily-rotate-file');
var transport = new (winston.transports.DailyRotateFile)({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });
  
  
var logs= winston.createLogger({
    transports: [
      transport,
    ]
  })
  logs.add(new winston.transports.Console({
    format: winston.format.simple()
  }));

export default logs