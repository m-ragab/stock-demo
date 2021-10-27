const winston = require('winston');
const config = require('config');
const express = require('express');
const app = express();

require('./startup/db')();
require('./startup/routes')(app);

const port = process.env.PORT || config.get('port');
app.listen(port, () => winston.info(`Listening on port ${port}`));