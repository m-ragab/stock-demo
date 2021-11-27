const { Customer, validateCustomer } = require('../models/customer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const _ = require('lodash');
const express = require('express');
const router = express.Router();


router.get('/', auth, async (req, res) => {
    let customers = await Customer.find().sort('name').select('-__v');
    res.send(customers);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    let customer = await Customer.findById(req.params.id).select('-__v');
    
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    
    res.send(customer);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = new Customer(_.pick(req.body, ['name', 'phone', 'isGold']));
    customer = await customer.save();

    res.send(_.pick(customer, ['_id', 'name', 'phone', 'isGold']));
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = await Customer.findByIdAndUpdate(
        req.params.id, _.pick(req.body, ['name', 'phone', 'isGold']), { new: true }
    );

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(_.pick(customer, ['_id', 'name', 'phone', 'isGold']));
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    let customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(_.pick(customer, ['name', 'phone', 'isGold']));
});


module.exports = router;