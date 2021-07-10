const mongoose = require('mongoose');

const rand_sex = require('../helpers/rand-image');
 

const schema = mongoose.Schema;

const sellerSchema = new schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    code: {
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
    wallet: {
        type: Number,
        default: 0
    },
    FCMJwt: [{
        type: String
    }],

    rate: {
        type: Number,
        default: 0
    },
    totalRate: {
        type: Number,
        default: 0
    },
    userRatre: {
        type: Number,
        default: 0
    },
    updated: {
        type: String,
        required: true
    },
    city:{
        type:String,
        required:true
    },
    sloldItems:[{
        product:{
            type:schema.Types.ObjectId,
            ref:'product'
        },
        client:{
            type:schema.Types.ObjectId,
            ref:'client'
        },
        amount:{
            type:Number
        },
        locationName:String,
        locationAddres:String,

    }],
    Notification:[{
        type:schema.Types.ObjectId,
        ref:'notification'
    }]
    
});

sellerSchema.index({ certificate: { location: "2dsphere" } });


// sellerSchema.methods.addSert = function (imageUrl, expires, long, lat, StringAdress, from, to) {

//     if (this.certificate.image.length > 0) {
//         this.certificate.image.forEach(element => {
//             deleteFile.deleteFile(__dirname + '/../' + element)
//         });
//     }

//     const cert = {
//         image: imageUrl,
//         expiresAt: expires,
//         state: 'binding',e
//             from: from,
//             to: to
//         }
//     };

//     this.certificate = cert;

//     return this.save()
// }

// sellerSchema.methods.certApprove = function () {

//     this.certificate.state = 'approve';
//     this.certificate.activated = true;
//     this.certificate.review = true;

//     return this.save();
// }

// sellerSchema.methods.certExpired = function () {

//     this.certificate.activated = false;

//     return this.save();
// }

// sellerSchema.methods.certDisapprove = function (adminN) {

//     this.certificate.state = 'disapprove';
//     this.certificate.activated = false;
//     this.certificate.review = true;
//     this.certificate.adminNote = adminN;

//     return this.save();
// }

// sellerSchema.methods.addCategory = function (name) {
//     let temp = this.category;
//     const find = temp.filter(f => {
//         return f == name;
//     });
//     if (find.length > 0) {
//         const error = new Error('category already exestes');
//         error.statusCode = 409;
//         error.state = 30;
//         throw error;
//     }

//     this.category.push(name);
//     if (this.certificate) {
//         this.certificate.activated = false;
//     }

//     return this.save();
// }

// sellerSchema.methods.deleteCategory = function (categoryId) {
//     let temp = this.category;
//     const updatedCategory = temp.filter(f => {
//         return f !== categoryId;
//     });

//     this.category = updatedCategory;
//     return this.save();
// }


module.exports = mongoose.model('seller', sellerSchema);