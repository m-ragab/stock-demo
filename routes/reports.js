const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Product } = require('../models/product');
const { Customer } = require('../models/customer');
const Order = require('../models/order');

router.get('/summary', auth, async (req, res) => {
    const [products, customers, orders] = await Promise.all([
        Product.find(),
        Customer.find(),
        Order.find()
    ]);

    const inventoryValue = products.reduce((sum, product) => sum + (Number(product.price) * Number(product.numberInStock)), 0);
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const productSales = orders.reduce((acc, order) => {
        for (const item of order.items || []) {
            if (!acc[item.name]) acc[item.name] = 0;
            acc[item.name] += Number(item.quantity || 0);
        }
        return acc;
    }, {});

    const topProducts = Object.entries(productSales)
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthNames.map((month, index) => {
        const currentYear = new Date().getFullYear();
        const monthStart = new Date(currentYear, index, 1);
        const monthEnd = new Date(currentYear, index + 1, 0, 23, 59, 59, 999);
        const revenue = orders
            .filter((order) => {
                const createdAt = new Date(order.createdAt);
                return createdAt >= monthStart && createdAt <= monthEnd;
            })
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        return { month, revenue };
    });

    res.send({
        productsCount: products.length,
        customersCount: customers.length,
        totalOrders: orders.length,
        totalRevenue,
        inventoryValue,
        topProducts,
        monthlyRevenue
    });
});

module.exports = router;
