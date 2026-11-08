const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../data/db');

class User {
    constructor(data = {}) {
        this._id = data._id || null;
        this.name = data.name || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.isAdmin = Boolean(data.isAdmin);
    }

    generateAuthToken() {
        return jwt.sign(
            {
                _id: this._id,
                name: this.name,
                email: this.email,
                isAdmin: this.isAdmin
            },
            config.get('jwtPrivateKey')
        );
    }

    async save() {
        if (!this._id) {
            const created = await db.create('users', { name: this.name, email: this.email, password: this.password, isAdmin: this.isAdmin });
            Object.assign(this, created);
            return this;
        }

        const updated = await db.update('users', this._id, { name: this.name, email: this.email, password: this.password, isAdmin: this.isAdmin });
        Object.assign(this, updated);
        return this;
    }

    static async find() {
        return await db.list('users');
    }

    static async findById(id) {
        return await db.findById('users', id);
    }

    static async findOne(query = {}) {
        return await db.findOne('users', query);
    }
}

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        isAdmin: Joi.boolean()
    });

    return schema.validate(user);
}

function validateAuth(user) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });

    return schema.validate(user);
}

module.exports = { User, validateUser, validateAuth };