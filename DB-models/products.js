const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    productType: {
        type: String,
        required: true
    },
    orders: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    fresh: {
        type: String,
        required: true,
    },
    seller: {
        type: schema.Types.ObjectId,
        ref: 'seller',
        required: true

    },
    price: {
        type: Number,
        required: true
    },
    quantity:{
     type:Number,
     required:true   
    }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);