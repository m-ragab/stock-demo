const Joi = require('joi');
const db = require('../data/db');

class Customer {
    constructor(data = {}) {
        this._id = data._id || null;
        this.name = data.name || '';
        this.phone = data.phone || '';
        this.isGold = Boolean(data.isGold);
    }

    async save() {
        if (!this._id) {
            const created = await db.create('customers', { name: this.name, phone: this.phone, isGold: this.isGold });
            Object.assign(this, created);
            return this;
        }

        const updated = await db.update('customers', this._id, { name: this.name, phone: this.phone, isGold: this.isGold });
        Object.assign(this, updated);
        return this;
    }

    static async find() {
        const items = await db.list('customers');
        return items.sort((a, b) => a.name.localeCompare(b.name));
    }

    static async findById(id) {
        return await db.findById('customers', id);
    }

    static async findOne(query = {}) {
        return await db.findOne('customers', query);
    }

    static async findByIdAndUpdate(id, update) {
        return await db.update('customers', id, update);
    }

    static async findByIdAndRemove(id) {
        return await db.remove('customers', id);
    }
}

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        phone: Joi.string().min(5).max(50).required(),
        isGold: Joi.boolean()
    });

    return schema.validate(customer);
}

module.exports = { Customer, validateCustomer };