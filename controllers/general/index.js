const Product = require("../../DB-models/products");
const Client = require("../../DB-models/client");
const Seller =require("../../DB-models/seller")
const Order =require("../../DB-models/order")
const { check, validationResult } = require('express-validator');
const {sendNotification} =require("../../helpers/sendNotfication")

exports.changeOrderStatus = async (req, res, next) => {
  const {status,orderId} = req.body;

  try {
    const editOrder=await Order.findById(orderId)
    editOrder.status=status;
   await editOrder.save()
   
   let notif={
    title:"order status changed",
    body:`order status changed `
  }
   sendNotification('',editOrder.client,'orderStatusChanged',notif,null)
 

    res.status(200).json({
        msg:"order status changed"
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.search = async (req, res, next) => {
  

  let search = req.query.search;
  const page=req.query.page||1
   const itemPerPage = 10 ;
   let totalItems;
   try {

     if(!search){
       const error = new Error('search key is empty');
       error.statusCode = 422 ;
       return next( error) ;
     }
     
       var searchParams=[]
      
          if(!isNaN(search)){
            search=Number(search)
            searchParams=[
            
              { price: search },
            
             

            ];
          }else{
            searchParams=[
              { name: new RegExp( search.trim() , 'i') },
              { productType: new RegExp( search.trim() , 'i') },
              { fresh: new RegExp( search.trim() , 'i') },
             
            
             

            ];

          }  

      

    
          

       
       
       totalItems = await Product.find({
           $or: searchParams,
        
         }).countDocuments();
         result = await Product.find({
           $or: searchParams,
          

         }).sort({ view: -1 })
           .skip((page - 1) * itemPerPage)
           .limit(itemPerPage);
       

           res.status(200).json({
               state: 1,
               totalItems:totalItems,
               searchResult: result,
             });
            }catch(err){
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            }
               










            };
