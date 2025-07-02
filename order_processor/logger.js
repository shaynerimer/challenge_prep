const winston = require('winston');

const addLogType = winston.format((info) => {
    info.logType = 'Application';
    return info;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        addLogType(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()]
});

module.exports = { logger }