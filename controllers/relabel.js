
const fs = require('fs')
const path = require('path')
const Fruit = require('../DB-models/fruit') ;

exports.postRelableFix = async (req, res, next) => {
    try {

        const imagePath = req.body.imagePath ;
        const name      = req.body.name;
        const type      = req.body.type;
        console.debug(path.join(__dirname + '/' +imagePath));

        console.log(fs.existsSync(path.join(__dirname + '/' +imagePath)));

        if(!fs.existsSync(path.join(__dirname + '../../' +imagePath))){
            const err = new Error('image not found');
            err.statusCode = 404 ;
            throw err ;
        }

        const newFruit = new Fruit({
            image:imagePath,
            name:name,
            type:type
        });

        const fruit = await newFruit.save();


        res.status(201).json({
            state:1,
            message:'created'
        });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

