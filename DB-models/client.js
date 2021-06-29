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
        // unit: {
        //     type: String,
        //     enum: ['kg', 'g', 'grain', 'Liter', 'Gallon', 'drzn', 'bag'],
        //     required: true
        // },
        path: {
            type: String,
            default: 'product'
        }
    }],
    // wallet: {
    //     type: Number,
    //     default: 0
    // },
    FCMJwt: [{
        type: String
    }],
    // lang:{
    //     type:String,
    //     default:'en'
    // },
    sendNotfication: {
        all: {
            type: Boolean,
            default: true
        },
        newOffer: {
            type: Boolean,
            default: true
        },
        offerStatus: {
            type: Boolean,
            default: true
        },
        update: {
            type: Boolean,
            default: true
        },
    },
    updated: {
        type: String,
        required: true
    },

    // verficationCode:String,
    // codeExpireDate:Date,
    // tempMobile:String,
    // tempCode:String
});

// clientSchema.methods.addToCart = function (prodductId, amount, unit, ref) {
//     const CreatedBerore = this.cart.findIndex(val => {
//         return val.product.toString() === prodductId.toString() && unit === val.unit;
//     });

//     let newAmount = 1;
//     const updatedCartItems = [...this.cart];

//     if (CreatedBerore >= 0) {
//         newAmount = this.cart[CreatedBerore].amount + amount;
//         updatedCartItems[CreatedBerore].amount = newAmount;
//     } else {
//         updatedCartItems.push({
//             product: prodductId,
//             amount: amount,
//             unit: unit,
//             path: ref
//         });
//     }
//     this.cart = updatedCartItems;
//     return this.save();
// }


// clientSchema.methods.removeFromCart = function (cartItemId) {
//     const updatedCartItems = this.cart.filter(item => {
//         return item._id.toString() !== cartItemId.toString();
//     });
//     this.cart = updatedCartItems;
//     return this.save();
// };


module.exports = mongoose.model('client', clientSchema);