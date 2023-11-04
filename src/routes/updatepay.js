const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

// models
const Order = require('../models/Order');

const { addImage, deleteImage } = require('../utils/use-media');

router.get("/get/:orderNumber",async(req,res)=>{
  const {orderNumber} = req.params

  const order = await Order.findOne({orderNumber}).populate(
    'userCustomer',
    {
      name: 1,
    }
  )
  return res.send(order)
})

router.post("/customerRequest/:orderId", async(req,res)=>{
  const {orderId} = req.params
  const orderDB = await Order.findById(orderId)
  if (orderDB.public_id_Request) await deleteImage(orderDB.public_id_Request)
  const result = await addImage(req.file.path, 'Stream Play/orders')
  await Order.findByIdAndUpdate(
    orderId,
    {
      pending: true,
      active: false,
      imgRequest: result.url,
      public_id_Request: result.public_id,
    },{
      new: true,
      runValidators: true,
    }
  )
  await fs.unlink(req.file.path);
  res.send("success")
})
module.exports = router;