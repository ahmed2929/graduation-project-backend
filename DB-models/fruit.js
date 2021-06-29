const mongoose = require('mongoose');

const schema = mongoose.Schema;

const fruitSchema = new schema({
    image:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['Fresh', 'Rotten', '0']  // '0' =>> stands for not apple,orange or banana
    },
    reviewed:{
        type:Boolean,
        default:false
    },
    approved:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

module.exports = mongoose.model('fruit', fruitSchema);