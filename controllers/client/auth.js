const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
//const SMS = require('../../helpers/sms');

const Client = require('../../DB-models/client');

exports.postSignup = async (req, res, next) => {
    const errors = validationResult(req);
    const name = req.body.name;
    const password = req.body.password;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const code = req.body.code;
    const sex = req.body.sex;
    const FCM = req.body.FCM || 'token';

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }


        const checkClient = await Client.findOne({ mobile: mobile });

        if (checkClient) {
            const error = new Error(`This user is already registered with mobile`);
            error.statusCode = 409;
            error.state = 6;
            throw error;
        }
        const checkClientEmail = await Client.findOne({ email: email });

        if (checkClientEmail) {
            const error = new Error(`This user is already registered with email`);
            error.statusCode = 409;
            error.state = 26;
            throw error;
        }
        const hashedPass = await bycript.hash(password, 12);
        const newClient = new Client({
            name: name,
            mobile: mobile,
            email: email,
            sex: sex,
            code: code,
            password: hashedPass,
            updated: Date.now().toString(),
            FCMJwt: [FCM]
        });

        const client = await newClient.save();

        const token = jwt.sign(
            {
                mobile: client.mobile,
                userId: client._id.toString(),
                updated: client.updated.toString()
            },
            process.env.JWT_PRIVATE_KEY_CLIENT
        );

        res.status(201).json({
            state: 1,
            message: 'client created and logedIn',
            data: {
                token: token,
                clientName: client.name,
                clientMobile: client.mobile,
                clientId: client._id,
                image: client.image,
                clientEmail:client.email
            }
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postLogin = async (req, res, next) => {
    const errors = validationResult(req);
    const emailOrPhone = req.body.emailOrPhone;
    const password = req.body.password;
    const FCM = req.body.FCM || 'token1';


    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const isEmail = emailOrPhone.search('@');
        let client;
        if (isEmail >= 0) {
            await check('emailOrPhone').isEmail().normalizeEmail().run(req);
            client = await Client.findOne({ email: req.body.emailOrPhone })
        } else {
            client = await Client.findOne({ mobile: emailOrPhone })
        }
        if (!client) {
            const error = new Error(`Client not found`);
            error.statusCode = 404;
            error.state = 7;
            throw error;
        }
        const isEqual = await bycript.compare(password, client.password);
        if (!isEqual) {
            const error = new Error('wrong password');
            error.statusCode = 401;
            error.state = 8;
            throw error;
        }
        if (client.blocked == true) {
            const error = new Error('client have been blocked');
            error.statusCode = 403;
            error.state = 4;
            throw error;
        }

        let index = -1;
        client.FCMJwt.forEach((element, ind) => {
            if (element == FCM) {
                index = ind
            }
        });

        if (index == -1) {
            client.FCMJwt.push(FCM);

            await client.save();
        }
        // else{
        //     client.FCMJwt[index] = {
        //         token:FCM,
        //         lang:lang
        //     }
        //     await client.save();
        // }

        const token = jwt.sign(
            {
                mobile: client.mobile,
                userId: client._id.toString(),
                updated: client.updated.toString(),
            },
            process.env.JWT_PRIVATE_KEY_CLIENT
        );

        res.status(200).json({
            state: 1,
            message: "logedin",
            data: {
                token: token,
                clientName: client.name,
                clientMobile: client.mobile,
                clientId: client._id,
                image: client.image,
                clientEmail:client.email
            }
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postSendSms = async (req, res, next) => {

    try {

        const client = await Client.findById(req.userId);

        const buf = crypto.randomBytes(2).toString('hex');
        const hashedCode = await bycript.hash(buf, 12)
        client.verficationCode = hashedCode;
        client.codeExpireDate = Date.now() + 900000;

        const message = `your verification code is ${buf}`;

        const { body, status } = await SMS.send(client.code, message);

        await client.save();

        res.status(200).json({
            state: 1,
            data: body,
            //code: buf,
            message: 'code sent'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.postCheckVerCode = async (req, res, next) => {
    const code = req.body.code;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const client = await Client.findById(req.userId).select('verficationCode mobile codeExpireDate verfication');
        const isEqual = await bycript.compare(code, client.verficationCode);

        if (!isEqual) {
            const error = new Error('wrong code!!');
            error.statusCode = 403;
            error.state = 36;
            throw error;
        }
        if (client.codeExpireDate <= Date.now()) {
            const error = new Error('verfication code expired');
            error.statusCode = 403;
            error.state = 37;
            throw error;
        }

        client.verfication = true;

        await client.save();

        res.status(200).json({
            state: 1,
            message: 'account activated'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postChangeMobile = async (req, res, next) => {
    const mobile = req.body.mobile;
    const code = req.body.code;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }


        const client = await Client.findById(req.userId);

        const checkClient = await Client.findOne({ mobile: mobile });

        if (checkClient) {
            const error = new Error(`This user is already registered with mobile`);
            error.statusCode = 409;
            error.state = 6;
            throw error;
        }

        client.mobile = mobile;
        client.code = code;

        await client.save();

        res.status(200).json({
            state: 1,
            data: client.mobile,
            message: 'mobile changed'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postForgetPassword = async (req, res, next) => {
    const mobile = req.body.mobile;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const client = await Client.findOne({ mobile: mobile }).select('code mobile verficationCode codeExpireDate');

        if (!client) {
            const error = new Error(`Client not found`);
            error.statusCode = 404;
            error.state = 7;
            throw error;
        }

        const buf = crypto.randomBytes(2).toString('hex');
        const hashedCode = await bycript.hash(buf, 12)
        client.verficationCode = hashedCode;
        client.codeExpireDate = Date.now() + 900000;

        const message = `your verification code is ${buf}`;

        const { body, status } = await SMS.send(client.code, message);
        await client.save();


        res.status(200).json({
            state: 1,
            data: body,
            //code: buf,
            message: 'code sent'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.postForgetPasswordVerfy = async (req, res, next) => {
    const mobile = req.body.mobile;
    const code = req.body.VerCode;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const client = await Client.findOne({ mobile: mobile }).select('mobile verficationCode codeExpireDate updated');

        if (!client) {
            const error = new Error(`Client not found`);
            error.statusCode = 404;
            error.state = 7;
            throw error;
        }


        const isEqual = await bycript.compare(code, client.verficationCode);

        if (!isEqual) {
            const error = new Error('wrong code!!');
            error.statusCode = 403;
            error.state = 36;
            throw error;
        }
        if (client.codeExpireDate <= Date.now()) {
            const error = new Error('verfication code expired');
            error.statusCode = 403;
            error.state = 37;
            throw error;
        }


        res.status(200).json({
            state: 1,
            message: 'code is ok <3'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.postForgetPasswordChangePassword = async (req, res, next) => {
    const mobile = req.body.mobile;
    const code = req.body.VerCode;
    const password = req.body.password;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const client = await Client.findOne({ mobile: mobile }).select('image name mobile verficationCode codeExpireDate updated password');

        if (!client) {
            const error = new Error(`Client not found`);
            error.statusCode = 404;
            error.state = 7;
            throw error;
        }


        const isEqual = await bycript.compare(code, client.verficationCode);

        if (!isEqual) {
            const error = new Error('wrong code!!');
            error.statusCode = 403;
            error.state = 36;
            throw error;
        }
        if (client.codeExpireDate <= Date.now()) {
            const error = new Error('verfication code expired');
            error.statusCode = 403;
            error.state = 37;
            throw error;
        }
        const isEqualNew = await bycript.compare(password, client.password);
        if (isEqualNew) {
            const error = new Error('new password must be defferent from old password');
            error.statusCode = 409;
            error.state = 15;
            throw error;
        }

        const hashedPass = await bycript.hash(password, 12);

        client.password = hashedPass;

        const updatedClient = await client.save();


        const token = jwt.sign(
            {
                mobile: updatedClient.mobile,
                userId: updatedClient._id.toString(),
                updated: updatedClient.updated.toString()
            },
            process.env.JWT_PRIVATE_KEY_CLIENT
        );

        res.status(200).json({
            state: 1,
            message: 'password changed and loged in',
            data: {
                token: token,
                clientName: updatedClient.name,
                clientMobile: updatedClient.mobile,
                clientId: updatedClient._id,
                image: updatedClient.image
            }
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postLogout = async (req, res, next) => {
    const FCM = req.body.FCM;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
            error.statusCode = 422;
            error.state = 5;
            throw error;
        }

        const client = await Client.findById(req.userId).select('FCMJwt');
        let temp = client.FCMJwt.filter(i => {
            return i.token.toString() !== FCM.toString();
        });
        client.FCMJwt = temp;
        await client.save();

        res.status(200).json({
            state: 1,
            message: 'logout!'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}




