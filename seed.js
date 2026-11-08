const { Product } = require('./models/product');
const { clearCollection, initDb } = require('./data/db');

const data = [
    { name: 'Keyboard', price: 20, numberInStock: 5 },
    { name: 'Mouse', price: 40, numberInStock: 6 },
    { name: 'Watch', price: 20, numberInStock: 3 },
    { name: 'Headfone', price: 200, numberInStock: 10 },
    { name: 'USB Flash Drive', price: 50, numberInStock: 15 },
    { name: 'Notebook Cooler', price: 150, numberInStock: 25 },
    { name: 'Camera', price: 1500, numberInStock: 5 },
    { name: 'Printer', price: 2000, numberInStock: 25 },
    { name: 'Tablet', price: 5000, numberInStock: 5 },
    { name: 'LED TV', price: 1500, numberInStock: 35 },
    { name: 'Router', price: 150, numberInStock: 30 }
];

async function seed() {
    await initDb();
    await clearCollection('products');

    for (const item of data) {
        const product = new Product(item);
        await product.save();
    }

    console.info('Done!');
}

seed();

