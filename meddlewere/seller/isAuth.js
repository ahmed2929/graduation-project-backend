const jwt = require('jsonwebtoken');

const Seller = require('../../DB-models/seller');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('not Authorized!!');
            error.statusCode = 401;
            error.state = 2;
            throw error;
        }
        const token = req.get('Authorization').split(' ')[1];

        let decodedToken;

        try {

            decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY_SELLER);

        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 401;
                err.state = 2;
            }
            throw err;
        }
        if (!decodedToken) {
            const error = new Error('not Authorized!!');
            error.statusCode = 401;
            error.state = 2;
            throw error;
        }

        const seller = await Seller.findById(decodedToken.userId).select('blocked category updated verfication certificate');

        if (!seller) {
            const error = new Error('user not found');
            error.statusCode = 404;
            error.state = 3;
            throw error;
        }

        if (seller.blocked == true) {
            const error = new Error('seller have been blocked');
            error.statusCode = 403;
            error.state = 4;
            throw error;
        }
        
        if (decodedToken.updated !== seller.updated.toString()) {
            const error = new Error('token expired please login');
            error.statusCode = 403;
            error.state = 17;
            throw error;
        }

        req.userId = decodedToken.userId;

        next();

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};