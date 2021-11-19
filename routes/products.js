const { Product, validateProduct } = require('../models/product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const _ = require('lodash');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    let products = await Product.find().sort('name').select('-__v');
    res.send(products);
});

router.get('/:id', validateObjectId, async (req, res) => {
    let product = await Product.findById(req.params.id).select('-__v');

    if (!product) return res.status(404).send('The Product with the given ID was not found.');

    res.send(product);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let product = new Product(_.pick(req.body, ['name', 'price', 'numberInStock']));
    product = await product.save();

    res.send(_.pick(product, ['_id', 'name', 'price', 'numberInStock']));
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let product = await Product.findByIdAndUpdate(
        req.params.id, _.pick(req.body, ['name', 'price', 'numberInStock']), { new: true }
    );

    if (!product) return res.status(404).send('The Product with the given ID was not found.');

    res.send(_.pick(product, ['_id', 'name', 'price', 'numberInStock']));
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    let product = await Product.findByIdAndRemove(req.params.id);

    if (!product) return res.status(404).send('The Product with the given ID was not found.');

    res.send(_.pick(product, ['name', 'price', 'numberInStock']));
});


module.exports = router;