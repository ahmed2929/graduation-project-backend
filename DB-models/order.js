const mongoose = require('mongoose');

const schema = mongoose.Schema;

const orderSchema = new schema({
    client: {
        type: schema.Types.ObjectId,
        ref: 'client'
    },
    seller: {
        type: schema.Types.ObjectId,
        ref: 'seller'
    },
    products: [{
        product: {
            type: schema.Types.Mixed,
            refPath: 'products.path'
        },
        amount: {
            type: Number,
            required: true
        },
        path: {
            type: String,
            default: 'product'
        }
    }],
    location: {
        type: { type: String },
        
    },
    locationDetails: {
        name:{
            type: String,
            
        },
        stringAdress:{
            type: String,
           
        },
      
    },
    status: {
        type: String,
        default: 'started'
    },
    pay: {
        type: Boolean,
        default: false
    },
    reted:{
        type: Boolean,
        default: false
    },
}, { timestamps: true });

orderSchema.index({ location: "2dsphere" });

orderSchema.methods.cancelOrder = function () {
    this.status = 'cancel';
    return this.save();
};

orderSchema.methods.endOrder = function () {
    this.status = 'ended';
    return this.save();
};


module.exports = mongoose.model('order', orderSchema);