const Product = require("../../DB-models/products");
const Client = require("../../DB-models/client");
const Seller =require("../../DB-models/seller")
const Order =require("../../DB-models/order")
const { check, validationResult } = require('express-validator');
const {sendNotification } =require("../../helpers/sendNotfication")
 
exports.getProducts = async (req, res, next) => {
  /**
   * this func accept query params id if it exist will return details of thar product
   *
   *
   */
  const page = req.query.page * 1 || 1;
  const id = req.query.id;
  const itemPerPage = 10;
  const order = req.query.order || -1;
  const date = Boolean(Number(req.query.date)) || false;
  const price = Boolean(Number(req.query.price)) || false;
  const productType = req.query.productType || false;
  let find = {}
  let totaProducts = 0;
  let allProducts;
  try {
    if (id) {
      const product = await Product.findById(id.toString()).select("-orders");

      return res.status(201).json({
        state: 1,
        message: `product in page ${page}`,
        products: product,
        total: 1,
      });
    }

    if (productType) {
      find = { productType: productType };
    }

    if (date) {
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders")
        .sort({ createdAt: order });
    } else if (price) {
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders")
        .sort({ price: order });
    }else{
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders");
    }


    res.status(201).json({
      state: 1,
      message: `product in page ${page}`,
      products: allProducts,
      total: totaProducts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const productId = req.body.productId;

  const amount = req.body.amount;
  const errors = validationResult(req);

  //const unit = req.body.unit;
  let newAmount = 1;
  let totalPrice = 0; // price for every product in cart
  let finalPrice = 0; // the total cart price 

  try {

    if (!errors.isEmpty()) {
      const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }

    const client = await Client.findById(req.userId);
    const addedProduct = await Product.findById(productId);
    if (!addedProduct) {
      const error = new Error(`product not found`);
      error.statusCode = 404;
      error.state = 9;
      throw error;
    }
    //console.log("client isssss" ,addedProduct)
    clientCart = [...client.cart];
    // console.log(clientCart);
    const createdBefore = clientCart.findIndex((val) => {
      return val.product.toString() === productId.toString();
    });

    if (createdBefore >= 0) {
      //let tempPrice=(addedProduct.price*amount)+clientCart[createdBefore].totalPrice;
      newAmount = clientCart[createdBefore].amount + amount;
      tempPrice = (addedProduct.price) * amount;
      totalPrice = clientCart[createdBefore].totalPrice + tempPrice

      //console.log("total price for created befor is  ", totalPrice);

      clientCart[createdBefore].amount = newAmount;
      clientCart[createdBefore].totalPrice = totalPrice;
    } else {
      totalPrice = addedProduct.price * amount;
      //console.log("total price for new product added is  ", totalPrice);
      clientCart.push({
        product: productId,
        amount: amount,
        totalPrice: totalPrice
        //  unit: unit,
      });

    }
    client.cart = clientCart;
    await client.save();


    for (prod in client.cart) {

      finalPrice = finalPrice + clientCart[prod].totalPrice;
    }

    res.status(201).json({
      state: 1,
      message: client.cart,
      finalPrice: finalPrice
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.getUserCart = async (req, res, next) => {

  try {
    const client = await Client.findById(req.userId)
    .select('cart')
    .populate({
      path:'cart.product',
      select:'name price seller imageUrl fresh',
      populate:{
        path:'seller',
        select:'name'
      }
    });
    const clientCart = client.cart;
    let finalPrice = 0 ;
    for (prod in client.cart) {

      finalPrice = finalPrice + clientCart[prod].totalPrice;
    }
    return res.status(200).json({
      cartItems: clientCart,
      finalPrice:finalPrice
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.makeOrder = async (req, res, next) => {
  try {
/**
 * 
 * 
 * 
 * 
 * 
 */

    const {locationName,locationAddres} = req.body;
    const client = await Client.findById(req.userId)
      .populate({
        path: "cart.product",
       
      }).populate('seller');

    let orderPrice = 0;

    if(client.cart.length<1){
      const error = new Error(`your cart is empty add some products`);
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }
      
    client.cart.forEach(async product => {
      // console.debug("product is ",product)
      orderPrice = orderPrice + product.totalPrice;
    const {seller}=product.product
    const editSeller =await Seller.findById(seller)
    const editproduct =await Product.findById(product.product._id)

   
    if(Number(editproduct.quantity)<Number(product.amount)){
     
     
      return res.status(422).json({
        message: `the amount you want is not avilable right now the avilable amount is ${editproduct.quantity}`,
         
      });
    }
    editproduct.quantity=  editproduct.quantity-product.amount;
    await editproduct.save()
    editSeller.sloldItems.push({
      product: product.product.id,
      client:req.userId,
      amount:product.amount,
      locationAddres,
      locationName
    })
    await editSeller.save()

     //////////////////////////////

    let notification={
      title:"new order created",
      body:`new order craeted by ${req.user.name} `
    }

     sendNotification('seller',editSeller._id,'newOrderCreated',notification,null)

     ////////////////////////////


  });
  

      const order = await new Order({
       client: req.userId,
       locationName:locationName,
        locationAddres:locationAddres,
        products: client.cart,
        totalPrice: orderPrice,
    }).save();
      client.cart = [];
     await client.save();

     let notif={
      title:"new order created",
      body:`new order craeted order `
    }
     sendNotification('',req.userId,'newOrderCreated',notif,order)
   
      return res.status(201).json({
       message: "order created",
        data: order,
     });


   } catch (err) {
   if (!err.statusCode) {
      err.statusCode = 500;
    }
     next(err);
   }
};

exports.getOrders = async (req, res, next) => {
  const type=req.query.type
  try {
    let orders
    if(type){
       orders = await Order.find({
        client:req.userId,
        status:type
      
      })
        .populate({
          path:'products'
        })
      
    }else{

       orders = await Order.find({
        client:req.userId,
      
      })
        .populate({
          path:'products'
        })

    }
   
   
    return res.status(200).json({
      orders
       
     });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.deleteFromCart = async (req, res, next) => {
  const productId = req.body.productId;
  const errors = validationResult(req);


  try {

    if (!errors.isEmpty()) {
      const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }

    const client = await Client.findById(req.userId);
    clientCart = [...client.cart];
    const updatedCart = clientCart.filter(item => {
      return item._id.toString() !== productId.toString();
    })

    client.cart = updatedCart;
    await client.save();
    return res.status(200).json({
      clientCart: client.cart
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}


exports.getNotification = async (req, res, next) => {
  try {
    const notification =await Client.findById(req.userId)
    .populate('Notification')
    .select('Notification')
    res.status(200).json({
      notification
    })

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
