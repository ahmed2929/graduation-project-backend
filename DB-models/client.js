const mongoose = require('mongoose');

const rand_sex = require('../helpers/rand-image');

const schema = mongoose.Schema;

const clientSchema = new schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: function () {
            return rand_sex(this.sex)
        }
    },
    verfication: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    sex: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    cart: [{
        product: {
            type: schema.Types.Mixed,
            refPath: 'cart.path'
        },
        amount: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            default: 0
        },
    
        path: {
            type: String,
            default: 'product'
        }
    }],
   
    FCMJwt: [{
        type: String
    }],
 
    updated: {
        type: String,
        required: true
    },
    Notification:[{
        type:schema.Types.ObjectId,
        ref:'notification'
    }]
  
});




module.exports = mongoose.model('client', clientSchema);