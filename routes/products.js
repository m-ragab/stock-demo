const { Product, validateProduct } = require('../models/product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    let products = await Product.find();
    products.sort((a, b) => a.name.localeCompare(b.name));
    res.send(products);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).send('The product with the given ID was not found.');

    res.send(product);
});

router.post('/', auth, async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = new Product(_.pick(req.body, ['name', 'price', 'numberInStock']));
    await product.save();

    res.send(_.pick(product, ['_id', 'name', 'price', 'numberInStock']));
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = await Product.findByIdAndUpdate(req.params.id, _.pick(req.body, ['name', 'price', 'numberInStock']));

    if (!product) return res.status(404).send('The product with the given ID was not found.');

    res.send(_.pick(product, ['_id', 'name', 'price', 'numberInStock']));
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);

    if (!product) return res.status(404).send('The product with the given ID was not found.');

    res.send(_.pick(product, ['name', 'price', 'numberInStock']));
});

module.exports = router;