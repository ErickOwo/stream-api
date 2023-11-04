const express = require("express");
const Account = require("../models/Account");
const router = express.Router();


router.get("/accountsdata", async(req, res)=>{
  const data = await Account.find();
  res.send(data);
})

module.exports = router;