require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const users = require('../routes/users');
const products = require('../routes/products');
const error = require('../middleware/error');


module.exports = function(app) {
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('tiny'));
    app.use('/api/users', users);
    app.use('/api/products', products);
    app.use(error);
}