const express = require('express');
const router = express.Router();

const privk = 'key_vDCqdvlrqG19ObhPiv57EKg'
const pubk = 'key_JQ2Ac7b0MQQ0bGP1tiZTLyZ'

var conekta = require('conekta');

conekta.api_key = privk;
conekta.locale = 'es';



router.post("/pay", (req, res) =>{
  conekta.Order.create({
    "currency": "MXN",
    "customer_info": {
      "name": "Jul Ceballos",
      "phone": "+5215555555555",
      "email": "jul@conekta.io"
    },
    "line_items": [{
      "name": "Box of Cohiba S1s",
      "unit_price": 35000,
      "quantity": 1
    }],
    "charges": [{
      "payment_method": {
        "type": "card",
        "token_id": "tok_test_visa_4242"
      }
    }]
  }).then(function (result) {
    res.send(result.toObject())
  }, function (error) {
    console.log(error)
  })
});

module.exports = router;