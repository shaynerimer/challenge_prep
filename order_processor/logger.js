const winston = require('winston');
const { transition } = require('xstate');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()]
});

module.exports = { logger }