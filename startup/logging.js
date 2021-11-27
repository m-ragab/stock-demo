const winston = require('winston');
require('express-async-errors');

module.exports = function () { 
    winston.createLogger({
        transports: [
            new winston.transports.Console({
                format: winston.format.cli({ colors: { info: 'blue' }})
            }),
            new winston.transports.File({
                filename: 'logfile.log',
                level: 'info'
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: 'exceptions.log' })
        ],
        rejectionHandlers: [
            new winston.transports.File({ filename: 'rejections.log' })
        ]
})};