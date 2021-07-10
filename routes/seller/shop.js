const express      = require('express');
const {body}       = require('express-validator');

const authController = require('../../controllers/seller/shop');
// const isAuthVerfy         = require('../../meddlewere/seller/isAuthVerfy');
 const isAuth         = require('../../meddlewere/seller/isAuth');

  

const router  = express.Router();

router.post('/addProduct' , isAuth,[
    body('name')
    .not().isEmpty()
    .trim(),
    body('productType')
    .not().isEmpty()
    .trim(),
    body('fresh')
    .not().isEmpty()
    .trim(),
],authController.postAddProduct);

router.post('/editProduct', isAuth, [
    body('name')
    .not().isEmpty()
    .trim(),
    body('productType')
    .not().isEmpty()
    .trim(),
    body('id')
    .not().isEmpty()
    
],authController.postEditProduct);

router.get('/Products',isAuth ,authController.getProduct);
router.get('/getOrders',isAuth ,authController.getOrders);
router.get('/getNotification', isAuth, authController.getNotification);


module.exports = router;