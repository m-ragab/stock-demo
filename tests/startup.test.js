const assert = require('assert');
const logger = require('../startup/logging')();

assert.ok(logger, 'Logger should be created and returned');
assert.ok(Array.isArray(logger.transports), 'Logger should have transports');
assert.ok(logger.transports.length > 0, 'Logger should include at least one transport');
console.log('startup logger test passed');
