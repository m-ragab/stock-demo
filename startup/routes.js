const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const users = require('../routes/users');
const customers = require('../routes/customers');
const products = require('../routes/products');
const orders = require('../routes/orders');
const reports = require('../routes/reports');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('tiny'));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use('/api/users', users);
    app.use('/api/customers', customers);
    app.use('/api/products', products);
    app.use('/api/orders', orders);
    app.use('/api/reports', reports);
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    app.get('/sales', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/sales.html'));
    });
    app.get('/orders', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/orders.html'));
    });
    app.get('/reports', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/reports.html'));
    });
    app.use(error);
}