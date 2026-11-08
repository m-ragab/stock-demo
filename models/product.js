const Joi = require('joi');
const db = require('../data/db');

class Product {
    constructor(data = {}) {
        this._id = data._id || null;
        this.name = data.name || '';
        this.price = data.price || 0;
        this.numberInStock = data.numberInStock || 0;
    }

    async save() {
        if (!this._id) {
            const created = await db.create('products', { name: this.name, price: this.price, numberInStock: this.numberInStock });
            Object.assign(this, created);
            return this;
        }

        const updated = await db.update('products', this._id, { name: this.name, price: this.price, numberInStock: this.numberInStock });
        Object.assign(this, updated);
        return this;
    }

    static async find() {
        const items = await db.list('products');
        return items.sort((a, b) => a.name.localeCompare(b.name));
    }

    static async findById(id) {
        return await db.findById('products', id);
    }

    static async findOne(query = {}) {
        return await db.findOne('products', query);
    }

    static async deleteMany(query = {}) {
        return await db.deleteMany('products', query);
    }

    static async findByIdAndUpdate(id, update) {
        return await db.update('products', id, update);
    }

    static async findByIdAndRemove(id) {
        return await db.remove('products', id);
    }
}

function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        price: Joi.number().required(),
        numberInStock: Joi.number().required()
    });

    return schema.validate(product);
}

module.exports = { Product, validateProduct };