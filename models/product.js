const Joi = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true
    },
    numberInStock: {
        type: Number,
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        price: Joi.number().required(),
        numberInStock: Joi.number().required()
    });

    return schema.validate(product);
}


exports.Product = Product;
exports.validateProduct = validateProduct;