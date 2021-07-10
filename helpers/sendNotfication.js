const Seller =require("../DB-models/seller")
const Client =require("../DB-models/client")
const Notification =require("../DB-models/notification")


const sendNotification=async(userType,userID,action,notification,data)=>{

    try{


        if(userType==='seller'){
            const seller=await Seller.findById(userID);
            const newNotifi =new Notification({
                action,
                data,
                notification
            })
            seller.Notification.push(newNotifi._id);
            await newNotifi.save();
            await seller.save();
           
        }else{
            const client=await Client.findById(userID);
            const newNotifi =new Notification({
                action,
                data,
                notification
            })
            client.Notification.push(newNotifi._id);
            await newNotifi.save();
            await client.save();
    
        }
        return true




    }catch(err){
        throw new Error(err)
    }

  
}

module.exports={
    sendNotification
}