const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Product } = require('../models/product');
const Order = require('../models/order');

router.get('/', auth, async (req, res) => {
    const orders = await Order.find();
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = await Promise.all(orders.map(async (order) => {
        const customer = order.customer ? ((await require('../models/customer').Customer.findById(order.customer)) || null) : null;
        const user = order.user ? ((await require('../models/user').User.findById(order.user)) || null) : null;
        return { ...order, customer, user };
    }));
    res.send(enriched);
});

router.post('/', auth, async (req, res) => {
    const { customerId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).send('At least one item is required for a sale.');
    }

    const savedItems = [];
    let totalAmount = 0;

    for (const item of items) {
        if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
            return res.status(400).send('Each item must include a valid product and quantity.');
        }

        const product = await Product.findById(item.productId);
        if (!product) {
            return res.status(404).send(`Product with id ${item.productId} was not found.`);
        }

        const quantity = Number(item.quantity);
        if (product.numberInStock < quantity) {
            return res.status(400).send(`Not enough stock for ${product.name}.`);
        }

        const total = Number(product.price) * quantity;
        savedItems.push({
            product: product._id,
            name: product.name,
            quantity,
            unitPrice: product.price,
            total
        });

        totalAmount += total;
        product.numberInStock = Number(product.numberInStock) - quantity;
        await Product.findByIdAndUpdate(product._id, { numberInStock: product.numberInStock });
    }

    const order = new Order({
        customer: customerId || null,
        user: req.user._id,
        items: savedItems,
        totalAmount,
        status: 'completed',
        createdAt: new Date().toISOString()
    });

    await order.save();
    res.status(201).send(order);
});

module.exports = router;
