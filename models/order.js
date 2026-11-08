const db = require('../data/db');

class Order {
    constructor(data = {}) {
        this._id = data._id || null;
        this.customer = data.customer || null;
        this.user = data.user || null;
        this.items = Array.isArray(data.items) ? data.items : [];
        this.totalAmount = Number(data.totalAmount || 0);
        this.status = data.status || 'completed';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    async save() {
        if (!this._id) {
            const created = await db.create('orders', {
                customer: this.customer,
                user: this.user,
                items: this.items,
                totalAmount: this.totalAmount,
                status: this.status,
                createdAt: this.createdAt
            });
            Object.assign(this, created);
            return this;
        }

        const updated = await db.update('orders', this._id, {
            customer: this.customer,
            user: this.user,
            items: this.items,
            totalAmount: this.totalAmount,
            status: this.status,
            createdAt: this.createdAt
        });
        Object.assign(this, updated);
        return this;
    }

    static async find() {
        const items = await db.list('orders');
        return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

module.exports = Order;
