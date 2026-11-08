const config = require('config');
const logger = require('./logging')();
const database = require('../data/db');

module.exports = async function () {
    const db = config.get('db');

    try {
        await database.initDb();
        logger.info(`Connected to local data store ${db}...`);
    } catch (error) {
        logger.error(`Could not initialize local data store ${db}: ${error.message}`);
        throw error;
    }
};