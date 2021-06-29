const express      = require('express');
const {body}       = require('express-validator');

const authController = require('../../controllers/seller/auth');
// const isAuthVerfy         = require('../../meddlewere/seller/isAuthVerfy');
// const isAuth         = require('../../meddlewere/seller/isAuth');


const router  = express.Router();

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail(),
    body('name')
    .not().isEmpty()
    .trim(),
    body('mobile')
    .not().isEmpty()
    .isMobilePhone().trim(),
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .trim()
    ,
    body('comfirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }),
    body('code')
    .not().isEmpty()
    .trim(),
    body('sex')
    .not().isEmpty(),
    body('city')
    .not().isEmpty()
],authController.postSignup);

router.post('/login',[
    body('emailOrPhone')
    .not().isEmpty()
    .trim(),
    body('password')
    .not().isEmpty()
    .trim(),
],authController.postLogin);

// //forget password
// router.post('/forgetPassword/mobile/sendSMS',[
//     body('mobile')
//     .not().isEmpty(),
// ],authController.postForgetPassword);

// router.post('/forgetPassword/mobile/verfy',[
//     body('mobile')
//     .not().isEmpty(),
//     body('VerCode')
//     .not().isEmpty(),
// ],authController.postForgetPasswordVerfy);
 
// router.post('/forgetPassword/changePassword',[
//     body('mobile')
//     .not().isEmpty(),
//     body('VerCode')
//     .not().isEmpty(),
//     body('password','enter a password with only number and text and at least 5 characters.')
//     .isLength({min:5})
//     .trim()
//     ,
//     body('comfirmPassword')
//     .trim()
//     .custom((value,{req})=>{
//         if(value!=req.body.password){
//             return Promise.reject('password has to match');
//         }
//         return true ;
//     })
// ],authController.postForgetPasswordChangePassword);

// //verfication
// router.post('/signup/verfication/send',isAuthVerfy,authController.postSendSms);

// router.post('/signup/verfication/check',[
//     body('code')
//     .not().isEmpty(),
// ],isAuthVerfy,authController.postCheckVerCode);

// router.post('/signup/verfication/changeMobile',[
//     body('mobile')
//     .not().isEmpty()
//     .trim().isMobilePhone(),
//     body('code')
//     .not().isEmpty()
//     .trim()
// ],isAuthVerfy,authController.postChangeMobile);

// router.post('/logout',[
//     body('FCM')
//     .not().isEmpty(),
// ],isAuth,authController.postLogout)

module.exports = router;