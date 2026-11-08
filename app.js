const config = require('config');
const express = require('express');
const logger = require('./startup/logging')();
const app = express();

async function start() {
	try {
		await require('./startup/db')();
		require('./startup/routes')(app);

		const port = Number(process.env.PORT || config.get('port'));
		const server = app.listen(port, () => logger.info(`Listening on port ${port}`));
		server.on('error', (error) => {
			logger.error(`Could not listen on port ${port}: ${error.message}`);
			process.exitCode = 1;
		});
	} catch (error) {
		logger.error(`Application startup failed: ${error.message}`);
		process.exitCode = 1;
	}
}

start();